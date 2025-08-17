"use node";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const create = mutation({
  args: {
    maxPlayers: v.number(),
    token: v.string(),
  },
  handler: async (ctx, { maxPlayers, token }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (!session || session.expires < Date.now()) {
      throw new Error("Not authenticated");
    }

    const userId = session.userId;
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if user is already in a battle
    const existingBattle = await ctx.db
      .query("multiplayerBattles")
      .filter((q) => 
        q.and(
          q.eq(q.field("hostId"), userId),
          q.neq(q.field("status"), "Finished")
        )
      )
      .first();

    if (existingBattle) {
      throw new Error("You are already in a multiplayer battle.");
    }

    const battleId = await ctx.db.insert("multiplayerBattles", {
      hostId: userId,
      playerIds: [userId],
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
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (!session || session.expires < Date.now()) {
      throw new Error("Not authenticated");
    }

    const userId = session.userId;
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const battle = await ctx.db.get(battleId);
    if (!battle) {
      throw new Error("Battle not found");
    }

    if (battle.playerIds.includes(userId)) {
      throw new Error("You are already in this battle.");
    }
    
    if (battle.status !== "Waiting") {
        throw new Error("This battle is no longer waiting for players.");
    }

    if (battle.playerIds.length >= battle.maxPlayers) {
      throw new Error("This battle is full.");
    }

    const newPlayerIds = [...battle.playerIds, userId];
    let newStatus: "Waiting" | "In Progress" | "Finished" = battle.status;
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
      .collect();

    const battlesWithPlayers = await Promise.all(
      battles.map(async (battle) => {
        const players = await Promise.all(
          battle.playerIds.map(async (playerId) => {
            const player = await ctx.db.get(playerId);
            return player ? {
              _id: player._id,
              name: player.name,
              image: player.image,
            } : null;
          })
        );
        
        return {
          ...battle,
          players: players.filter(Boolean),
        };
      })
    );

    return battlesWithPlayers;
  },
});

export const get = query({
  args: { battleId: v.id("multiplayerBattles") },
  handler: async (ctx, { battleId }) => {
    const battle = await ctx.db.get(battleId);
    if (!battle) return null;

    const players = await Promise.all(
      battle.playerIds.map(async (playerId) => {
        const player = await ctx.db.get(playerId);
        return player ? {
          _id: player._id,
          name: player.name,
          image: player.image,
        } : null;
      })
    );

    return {
      ...battle,
      players: players.filter(Boolean),
    };
  },
});