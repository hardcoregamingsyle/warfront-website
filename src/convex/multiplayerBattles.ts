"use node";
import { v } from "convex/values";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Get user from session token
const getUserFromToken = async (ctx: any, token: string) => {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .unique();

  if (!session || session.expires < Date.now()) {
    throw new Error("Invalid or expired session");
  }

  return await ctx.db.get(session.userId);
};

export const create = mutation({
  args: {
    token: v.string(),
    maxPlayers: v.number(),
  },
  handler: async (ctx, { token, maxPlayers }) => {
    const user = await getUserFromToken(ctx, token);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if user is already in a battle
    const existingBattle = await ctx.db
      .query("multiplayerBattles")
      .withIndex("by_playerIds", (q) => q.eq("playerIds", user._id))
      .filter((q) => q.neq(q.field("status"), "Finished"))
      .first();

    if (existingBattle) {
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
    token: v.string(),
    battleId: v.id("multiplayerBattles"),
  },
  handler: async (ctx, { token, battleId }) => {
    const user = await getUserFromToken(ctx, token);
    if (!user) {
      throw new Error("User not found");
    }

    const battle = await ctx.db.get(battleId);
    if (!battle) {
      throw new Error("Battle not found");
    }

    if (battle.playerIds.includes(user._id)) {
      throw new Error("You are already in this battle.");
    }
    
    if (battle.status !== "Waiting") {
        throw new Error("This battle is no longer waiting for players.");
    }

    if (battle.playerIds.length >= battle.maxPlayers) {
      throw new Error("This battle is full.");
    }

    const newPlayerIds = [...battle.playerIds, user._id];
    let newStatus = battle.status;
    if (newPlayerIds.length === battle.maxPlayers) {
        newStatus = "In Progress";
    }

    await ctx.db.patch(battleId, {
      playerIds: newPlayerIds,
      status: newStatus,
      lastActivity: Date.now(),
    });

    return battleId;
  },
});

export const list = query({
  handler: async (ctx) => {
    const battles = await ctx.db
      .query("multiplayerBattles")
      .withIndex("by_status", (q) => q.eq("status", "Waiting"))
      .order("desc")
      .collect();

    const battlesWithDetails = await Promise.all(
      battles.map(async (battle) => {
        const players = await Promise.all(
          battle.playerIds.map(async (playerId) => {
            const player = await ctx.db.get(playerId);
            return {
              _id: player?._id,
              name: player?.name,
              image: player?.image,
            };
          })
        );
        return {
          ...battle,
          players,
        };
      })
    );

    return battlesWithDetails;
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
            battle.playerIds.map(async (playerId) => {
                const player = await ctx.db.get(playerId);
                return {
                    _id: player?._id,
                    name: player?.name,
                    image: player?.image,
                };
            })
        );

        return {
            ...battle,
            players,
        };
    },
});