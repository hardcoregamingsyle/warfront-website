import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Helper to get user from token
const getUserFromToken = async (ctx: any, token: string) => {
    if (!token) {
        return null;
    }
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q: any) => q.eq("token", token))
      .unique();

    if (!session || session.expires < Date.now()) {
      return null;
    }
    return await ctx.db.get(session.userId);
};

export const list = query({
    args: {},
    handler: async (ctx) => {
        const battles = await ctx.db
            .query("multiplayerBattles")
            .withIndex("by_status", (q) => q.eq("status", "Waiting"))
            .order("desc")
            .collect();

        return Promise.all(
            battles.map(async (battle) => {
                const players = await Promise.all(
                    battle.playerIds.map((playerId) => ctx.db.get(playerId))
                );
                const filteredPlayers = players.filter(p => p !== null);
                return {
                    ...battle,
                    players: filteredPlayers,
                };
            })
        );
    },
});

export const get = query({
    args: { battleId: v.id("multiplayerBattles") },
    handler: async (ctx, { battleId }) => {
        const battle = await ctx.db.get(battleId);
        if (!battle) {
            return null;
        }
        const players = await Promise.all(
            battle.playerIds.map((playerId) => ctx.db.get(playerId))
        );
        const filteredPlayers = players.filter(p => p !== null);
        return {
            ...battle,
            players: filteredPlayers,
        };
    },
});

export const create = mutation({
    args: {
        maxPlayers: v.number(),
        token: v.string(),
    },
    handler: async (ctx, { maxPlayers, token }) => {
        const user = await getUserFromToken(ctx, token);
        if (!user) {
            throw new Error("User not authenticated");
        }

        // Check if user is already in an active battle
        const existingBattles = await ctx.db.query("multiplayerBattles")
            .withIndex("by_playerIds", q => q.eq("playerIds", user._id))
            .collect();

        const activeBattle = existingBattles.find(b => b.status !== "Finished");

        if (activeBattle) {
            throw new Error("You are already in a multiplayer battle.");
        }

        const battleId = await ctx.db.insert("multiplayerBattles", {
            hostId: user._id,
            playerIds: [user._id],
            maxPlayers,
            status: "Waiting",
            lastActivity: Date.now(),
        });

        return battleId;
    },
});

export const join = mutation({
    args: {
        battleId: v.id("multiplayerBattles"),
        token: v.string(),
    },
    handler: async (ctx, { battleId, token }) => {
        const user = await getUserFromToken(ctx, token);
        if (!user) {
            throw new Error("User not authenticated");
        }

        const battle = await ctx.db.get(battleId);
        if (!battle) {
            throw new Error("Battle not found");
        }
        
        if (battle.status !== "Waiting") {
            throw new Error("This battle is no longer open for joining.");
        }

        if (battle.playerIds.includes(user._id)) {
            // User is already in the battle, just return
            return;
        }

        if (battle.playerIds.length >= battle.maxPlayers) {
            throw new Error("Battle is full");
        }

        await ctx.db.patch(battle._id, {
            playerIds: [...battle.playerIds, user._id],
            lastActivity: Date.now(),
        });

        // If the battle is now full, change its status
        if (battle.playerIds.length + 1 === battle.maxPlayers) {
            await ctx.db.patch(battle._id, {
                status: "In Progress",
            });
        }
    },
});

export const cleanupInactiveBattles = internalMutation({
    handler: async (ctx) => {
        const now = Date.now();
        const INACTIVE_THRESHOLD = 10 * 60 * 1000; // 10 minutes

        const inactiveBattles = await ctx.db
            .query("multiplayerBattles")
            .withIndex("by_status_and_lastActivity", q => q.eq("status", "Waiting").lt("lastActivity", now - INACTIVE_THRESHOLD))
            .collect();

        for (const battle of inactiveBattles) {
            await ctx.db.delete(battle._id);
        }
    },
});