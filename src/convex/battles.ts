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

async function isUserInAnyBattle(ctx: any, userId: Id<"users">) {
    // Check multiplayer battles
    const inMultiplayer = await ctx.db
        .query("multiplayerBattles")
        .withIndex("by_playerIds", (q: any) => q.eq("playerIds", userId))
        .filter((q: any) => q.neq(q.field("status"), "Finished"))
        .first();
    if (inMultiplayer) return true;

    // Check 1v1 battles
    const in1v1 = await ctx.db
        .query("battles")
        .filter((q: any) => q.or(q.eq(q.field("hostId"), userId), q.eq(q.field("opponentId"), userId)))
        .filter((q: any) => q.neq(q.field("status"), "Finished"))
        .first();
    if (in1v1) return true;

    return false;
}

export const create = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const user = await getUserFromToken(ctx, token);
    if (!user) {
      throw new Error("User not authenticated or session expired.");
    }

    if (await isUserInAnyBattle(ctx, user._id)) {
      throw new Error("You are already in a battle.");
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
  args: { battleId: v.id("battles"), token: v.string() },
  handler: async (ctx, { battleId, token }) => {
    const user = await getUserFromToken(ctx, token);
    if (!user) {
      throw new Error("User not authenticated or session expired.");
    }
    
    if (await isUserInAnyBattle(ctx, user._id)) {
      throw new Error("You are already in a battle.");
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

export const cancel = mutation({
    args: { battleId: v.id("battles"), token: v.string() },
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
            throw new Error("Only the host can cancel the battle.");
        }

        if (battle.status !== "Open") {
            throw new Error("Cannot cancel a battle that is not open.");
        }

        await ctx.db.delete(battleId);
    },
});