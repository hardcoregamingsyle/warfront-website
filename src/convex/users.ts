import { getAuthUserId } from "@convex-dev/auth/server";
import { query, QueryCtx, mutation, action, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import bcrypt from "bcryptjs";

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
        .withIndex("by_username", (q) => q.eq("username", args.username.toLowerCase()))
        .unique();

      if (byUsername) {
        return { available: false, message: "Username is already taken." };
      }
    }

    // Remove email uniqueness check - allow multiple accounts with same email
    return { available: true };
  },
});

export const signupAction = action({
  args: {
    username: v.string(),
    email: v.string(),
    gender: v.string(),
    dob: v.string(),
    password: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Check for username availability
    const existingUser = await ctx.runQuery(internal.users.getUserByUsername, {
      username: args.username.toLowerCase(),
    });
    if (existingUser) {
      throw new Error("Username is already taken.");
    }

    // Hash password in action (allows setTimeout)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(args.password, salt);

    // Store pending user data
    await ctx.runMutation(internal.users.storePendingUser, {
      username: args.username,
      email: args.email,
      gender: args.gender,
      dob: args.dob,
      passwordHash,
    });

    return null;
  },
});

export const storePendingUser = internalMutation({
  args: {
    username: v.string(),
    email: v.string(),
    gender: v.string(),
    dob: v.string(),
    passwordHash: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("pendingUsers", {
      email: args.email.toLowerCase(),
      username: args.username.toLowerCase(),
      gender: args.gender,
      dob: args.dob,
      password: args.passwordHash,
    });
    return null;
  },
});

export const completeSignup = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, { email }) => {
    const pendingUser = await ctx.db
      .query("pendingUsers")
      .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
      .unique();

    if (!pendingUser) {
      throw new Error("Pending user not found.");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email.toLowerCase()))
      .unique();

    if (!user) {
      throw new Error("User not found.");
    }

    await ctx.db.patch(user._id, {
      username: pendingUser.username,
      gender: pendingUser.gender,
      dob: pendingUser.dob,
      password: pendingUser.password,
      name: pendingUser.username,
      role: "user",
    });

    await ctx.db.delete(pendingUser._id);

    return { success: true };
  },
});

export const getUserByUsername = internalQuery({
  args: { username: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      name: v.optional(v.string()),
      username: v.optional(v.string()),
      email: v.optional(v.string()),
      password: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      gender: v.optional(v.string()),
      dob: v.optional(v.string()),
      role: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx, { username }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username.toLowerCase()))
      .unique();
  },
});

export const getUserByEmail = internalQuery({
  args: { email: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      name: v.optional(v.string()),
      username: v.optional(v.string()),
      email: v.optional(v.string()),
      password: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      gender: v.optional(v.string()),
      dob: v.optional(v.string()),
      role: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email.toLowerCase()))
      .first();
  },
});

export const loginAction = action({
  args: {
    identifier: v.string(), // Can be either username or email
    password: v.string(),
  },
  returns: v.object({ email: v.string() }),
  handler: async (ctx, { identifier, password }) => {
    let user: any = null;

    // Check if identifier contains @ (likely email)
    if (identifier.includes("@")) {
      user = await ctx.runQuery(internal.users.getUserByEmail, { email: identifier.toLowerCase() });
    } else {
      user = await ctx.runQuery(internal.users.getUserByUsername, { username: identifier.toLowerCase() });
    }

    if (!user) {
      throw new Error("User not found.");
    }

    if (!user.password) {
      throw new Error(
        "This account was created with a different sign-in method. Please use that method to log in.",
      );
    }

    if (!user.emailVerificationTime) {
      throw new Error("Please verify your email before logging in.");
    }

    // Verify password in action (allows setTimeout)
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      throw new Error("Incorrect password.");
    }

    if (!user.email) {
      throw new Error("User email not found.");
    }

    // On success, return the user's email
    return { email: user.email };
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