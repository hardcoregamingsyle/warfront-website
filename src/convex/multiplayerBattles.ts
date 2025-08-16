import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

async function getUserFromToken(ctx: any, token: string) {
    const userSession = await ctx.db
        .query("sessions")
        .withIndex("by_token", (q: any) => q.eq("token", token))
        .unique();

    if (!userSession || userSession.expires < Date.now()) {
        return null;
    }

    return await ctx.db.get(userSession.userId);
}

async function isUserInBattle(ctx: any, userId: Id<"users">) {
    const existingBattle = await ctx.db
        .query("multiplayerBattles")
        .withIndex("by_playerIds", (q: any) => q.eq("playerIds", userId))
        .first();
    return existingBattle !== null;
}

export const create = mutation({
  args: { token: v.string(), maxPlayers: v.number() },
  handler: async (ctx, { token, maxPlayers }) => {
    const user = await getUserFromToken(ctx, token);
    if (!user) {
      throw new Error("User not authenticated or session expired.");
    }

    if (await isUserInBattle(ctx, user._id)) {
        throw new Error("You are already in a battle.");
    }

    if (maxPlayers < 3 || maxPlayers > 10) {
        throw new Error("Number of players must be between 3 and 10.");
    }

    const battleId = await ctx.db.insert("multiplayerBattles", {
      hostId: user._id,
      playerIds: [user._id],
      maxPlayers,
      status: "Waiting",
    });

    return battleId;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const battles = await ctx.db.query("multiplayerBattles").withIndex("by_status", q => q.eq("status", "Waiting")).order("desc").collect();

    const populatedBattles = await Promise.all(
        battles.map(async (battle) => {
            const host = await ctx.db.get(battle.hostId);
            const players = await Promise.all(
                battle.playerIds.map(playerId => ctx.db.get(playerId))
            );
            return {
                ...battle,
                host,
                players: players.filter(Boolean), // remove nulls if a user is deleted
            };
        })
    );

    return populatedBattles;
  },
});

export const join = mutation({
  args: { battleId: v.id("multiplayerBattles"), token: v.string() },
  handler: async (ctx, { battleId, token }) => {
    const user = await getUserFromToken(ctx, token);
    if (!user) {
      throw new Error("User not authenticated or session expired.");
    }

    if (await isUserInBattle(ctx, user._id)) {
        throw new Error("You are already in a battle.");
    }

    const battle = await ctx.db.get(battleId);

    if (!battle) {
      throw new Error("Battle not found.");
    }

    if (battle.status !== "Waiting") {
      throw new Error("This battle is not open to join.");
    }

    if (battle.playerIds.length >= battle.maxPlayers) {
        throw new Error("This battle is full.");
    }

    if (battle.playerIds.includes(user._id)) {
        throw new Error("You have already joined this battle.");
    }

    await ctx.db.patch(battleId, {
      playerIds: [...battle.playerIds, user._id],
    });
  },
});

export const leave = mutation({
    args: { battleId: v.id("multiplayerBattles"), token: v.string() },
    handler: async (ctx, { battleId, token }) => {
        const user = await getUserFromToken(ctx, token);
        if (!user) {
            throw new Error("User not authenticated or session expired.");
        }

        const battle = await ctx.db.get(battleId);
        if (!battle) {
            throw new Error("Battle not found.");
        }

        if (!battle.playerIds.includes(user._id)) {
            throw new Error("You are not in this battle.");
        }

        const updatedPlayerIds = battle.playerIds.filter(id => id !== user._id);

        if (updatedPlayerIds.length === 0) {
            await ctx.db.delete(battleId);
            return;
        }

        if (battle.hostId === user._id) {
            // Host is leaving, assign a new host
            const newHostId = updatedPlayerIds[0];
            await ctx.db.patch(battleId, {
                playerIds: updatedPlayerIds,
                hostId: newHostId,
            });
        } else {
            // A player is leaving
            await ctx.db.patch(battleId, {
                playerIds: updatedPlayerIds,
            });
        }
    },
});

export const start = mutation({
    args: { battleId: v.id("multiplayerBattles"), token: v.string() },
    handler: async (ctx, { battleId, token }) => {
        const user = await getUserFromToken(ctx, token);
        if (!user) {
          throw new Error("User not authenticated or session expired.");
        }

        const battle = await ctx.db.get(battleId);

        if (!battle) {
            throw new Error("Battle not found.");
        }

        if (battle.hostId !== user._id) {
            throw new Error("Only the host can start the battle.");
        }

        if (battle.playerIds.length < 3) {
            throw new Error("Minimum of 3 players required to start.");
        }

        await ctx.db.patch(battleId, {
            status: "In Progress",
        });
    },
});