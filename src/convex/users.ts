import { getAuthUserId } from "@convex-dev/auth/server";
import { query, QueryCtx, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get the current signed in user. Returns null if the user is not signed in.
 * Usage: const signedInUser = await ctx.runQuery(api.authHelpers.currentUser);
 * THIS FUNCTION IS READ-ONLY. DO NOT MODIFY.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if (user === null) {
      return null;
    }

    return user;
  },
});

export const checkAvailability = query({
  args: {
    username: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.username) {
      const byUsername = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", args.username))
        .unique();

      if (byUsername) {
        return { available: false, message: "Username is already taken." };
      }
    }

    if (args.email) {
      const byEmail = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", args.email))
        .unique();

      if (byEmail) {
        return { available: false, message: "Email is already in use." };
      }
    }

    return { available: true };
  },
});

export const updateUserProfile = mutation({
  args: {
    username: v.string(),
    gender: v.string(),
    dob: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    if (!user) {
      throw new Error("User not authenticated.");
    }

    await ctx.db.patch(user._id, {
      username: args.username,
      gender: args.gender,
      dob: args.dob,
      name: args.username,
    });
  },
});

/**
 * Use this function internally to get the current user data. Remember to handle the null user case.
 * @param ctx
 * @returns
 */
export const getCurrentUser = async (ctx: QueryCtx) => {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    return null;
  }
  return await ctx.db.get(userId);
};