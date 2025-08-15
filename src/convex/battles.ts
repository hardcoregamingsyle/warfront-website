import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const create = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User not authenticated.");
    }
    const user = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", identity.email!))
        .unique();

    if (!user) {
        throw new Error("User not found.");
    }

    // Check if user already has an open battle
    const existingBattle = await ctx.db
      .query("battles")
      .withIndex("by_hostId_and_status", (q) =>
        q.eq("hostId", user._id).eq("status", "Open"),
      )
      .first();

    if (existingBattle) {
      throw new Error("You already have an open battle.");
    }

    const battleId = await ctx.db.insert("battles", {
      hostId: user._id,
      status: "Open",
    });

    return battleId;
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const battles = await ctx.db.query("battles").order("desc").collect();

    const userIds = new Set<Id<"users">>();
    battles.forEach((b) => {
      userIds.add(b.hostId);
      if (b.opponentId) {
        userIds.add(b.opponentId);
      }
    });

    const users = await Promise.all(
      Array.from(userIds).map((id) => ctx.db.get(id)),
    );
    const usersById = new Map(users.filter(Boolean).map((u) => [u!._id, u]));

    return battles.map((battle) => {
      return {
        ...battle,
        host: usersById.get(battle.hostId),
        opponent: battle.opponentId
          ? usersById.get(battle.opponentId)
          : null,
      };
    });
  },
});

export const join = mutation({
  args: { battleId: v.id("battles") },
  handler: async (ctx, { battleId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User not authenticated.");
    }
    const user = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", identity.email!))
        .unique();

    if (!user) {
        throw new Error("User not found.");
    }

    const battle = await ctx.db.get(battleId);

    if (!battle) {
      throw new Error("Battle not found.");
    }

    if (battle.status !== "Open") {
      throw new Error("This battle is not open to join.");
    }

    if (battle.hostId === user._id) {
      throw new Error("You cannot join your own battle.");
    }

    await ctx.db.patch(battleId, {
      opponentId: user._id,
      status: "Full",
    });
  },
});
