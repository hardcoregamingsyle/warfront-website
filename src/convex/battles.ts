import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

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

async function getUserByToken(ctx: any, token: string) {
    const userSession = await ctx.db
        .query("sessions")
        .withIndex("by_token", (q: any) => q.eq("token", token))
        .unique();

    if (!userSession || userSession.expires < Date.now()) {
        return null;
    }

    return await ctx.db.get(userSession.userId);
}

async function isUserInAnyBattle(ctx: any, userId: Id<"users">) {
    // Check 1v1 battles
    const in1v1 = await ctx.db
        .query("battles")
        .filter((q: any) => q.or(q.eq(q.field("hostId"), userId), q.eq(q.field("opponentId"), userId)))
        .filter((q: any) => q.neq(q.field("status"), "Finished"))
        .first();
    if (in1v1) return true;

    // Check multiplayer battles
    const inMultiplayer = await ctx.db
        .query("multiplayerBattles")
        .withIndex("by_playerIds", (q: any) => q.eq("playerIds", userId))
        .filter((q: any) => q.neq(q.field("status"), "Finished"))
        .first();
    if (inMultiplayer) return true;

    return false;
}

export const create = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const user = await getUserByToken(ctx, token);
    if (!user) {
      throw new Error("User not authenticated!");
    }

    const existingBattle = await ctx.db
      .query("battles")
      .withIndex("by_hostId", (q) => q.eq("hostId", user._id))
      .first();

    const existingMultiplayerBattle = await ctx.db
      .query("multiplayerBattles")
      .filter((q) => q.eq(q.field("hostId"), user._id))
      .first();

    if (existingBattle || existingMultiplayerBattle) {
      throw new Error(
        "You are already in a Battle. You cannot Create or Join another Battle",
      );
    }

    await ctx.db.insert("battles", {
      hostId: user._id,
      status: "Open",
      lastActivity: Date.now(),
    });
  },
});

export const join = mutation({
  args: { battleId: v.id("battles"), token: v.string() },
  handler: async (ctx, { battleId, token }) => {
    const user = await getUserByToken(ctx, token);
    if (!user) {
      throw new Error("User not authenticated!");
    }

    const battle = await ctx.db.get(battleId);
    if (!battle) {
      throw new Error("Battle not found!");
    }

    if (battle.hostId === user._id) {
      throw new Error("You cannot join your own battle!");
    }

    if (battle.status !== "Open") {
      throw new Error("Battle is not open to join!");
    }

    const existingBattle = await ctx.db
      .query("battles")
      .withIndex("by_hostId", (q) => q.eq("hostId", user._id))
      .first();

    const existingMultiplayerBattle = await ctx.db
      .query("multiplayerBattles")
      .filter((q) => q.eq(q.field("hostId"), user._id))
      .first();

    if (existingBattle || existingMultiplayerBattle) {
      throw new Error(
        "You are already in a Battle. You cannot Create or Join another Battle",
      );
    }

    await ctx.db.patch(battleId, {
      opponentId: user._id,
      status: "Full",
      lastActivity: Date.now(),
    });
  },
});

export const cancel = mutation({
  args: { battleId: v.id("battles"), token: v.string() },
  handler: async (ctx, { battleId, token }) => {
    const user = await getUserByToken(ctx, token);
    if (!user) {
      throw new Error("User not authenticated!");
    }

    const battle = await ctx.db.get(battleId);
    if (!battle) {
      throw new Error("Battle not found!");
    }

    if (battle.hostId !== user._id) {
      throw new Error("You are not the host of this battle!");
    }

    await ctx.db.delete(battleId);
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const battles = await ctx.db.query("battles").withIndex("by_status", q => q.eq("status", "Open")).order("desc").collect();

    const battlesWithDetails = await Promise.all(
      battles.map(async (battle) => {
        const host = await ctx.db.get(battle.hostId);
        const opponent = battle.opponentId
          ? await ctx.db.get(battle.opponentId)
          : null;
        return {
          ...battle,
          host: host ? { name: host.name, image: host.image } : null,
          opponent: opponent
            ? { name: opponent.name, image: opponent.image }
            : null,
        };
      }),
    );
    return battlesWithDetails;
  },
});

export const get = query({
  args: { battleId: v.id("battles") },
  handler: async (ctx, { battleId }) => {
    const battle = await ctx.db.get(battleId);
    if (!battle) {
      return null;
    }
    const host = await ctx.db.get(battle.hostId);
    const opponent = battle.opponentId
      ? await ctx.db.get(battle.opponentId)
      : null;

    return {
      ...battle,
      host,
      opponent,
    };
  },
});

export const cleanupInactiveBattles = internalMutation({
  handler: async (ctx) => {
    const twentyMinutesAgo = Date.now() - 20 * 60 * 1000;
    const inactiveBattles = await ctx.db
      .query("battles")
      .filter((q) =>
        q.and(
          q.lt(q.field("lastActivity"), twentyMinutesAgo),
          q.neq(q.field("status"), "Complete"),
        ),
      )
      .collect();

    for (const battle of inactiveBattles) {
      await ctx.db.delete(battle._id);
    }
  },
});