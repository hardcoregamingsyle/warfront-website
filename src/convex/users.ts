import { getAuthUserId } from "@convex-dev/auth/server";
import { query, QueryCtx, mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
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
        .withIndex("by_username", (q) => q.eq("username", args.username))
        .unique();

      if (byUsername) {
        return { available: false, message: "Username is already taken." };
      }
    }

    // Remove email uniqueness check - allow multiple accounts with same email
    return { available: true };
  },
});

export const signup = mutation({
  args: {
    username: v.string(),
    email: v.string(),
    gender: v.string(),
    dob: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(args.password, salt);

    const userId = await ctx.db.insert("users", {
      name: args.username,
      username: args.username,
      email: args.email,
      gender: args.gender,
      dob: args.dob,
      password: passwordHash,
      otp,
      otpExpires,
      role: "user",
    });

    // @ts-ignore - Bypassing TypeScript error due to Convex code generation issue
    await ctx.scheduler.runAfter(0, internal.auth_resend.sendOtp, {
      email: args.email,
      otp,
    });

    return userId;
  },
});

export const verifyOtp = mutation({
  args: {
    userId: v.id("users"),
    otp: v.string(),
  },
  handler: async (ctx, { userId, otp }) => {
    const user = await ctx.db.get(userId);

    if (!user || user.otp !== otp || (user.otpExpires ?? 0) < Date.now()) {
      throw new Error("Invalid or expired OTP.");
    }

    await ctx.db.patch(user._id, {
      otp: undefined,
      otpExpires: undefined,
      emailVerificationTime: Date.now(),
    });

    return { success: true };
  },
});

export const login = mutation({
  args: {
    email: v.string(),
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { email, username, password }) => {
    // First find user by username
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .unique();

    if (!user) {
      throw new Error("User not found.");
    }

    // Verify the email matches
    if (user.email !== email) {
      throw new Error("Email and username do not match.");
    }

    if (!user.password) {
      throw new Error(
        "This account was created with a different sign-in method. Please use that method to log in.",
      );
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      throw new Error("Incorrect password.");
    }

    if (!user.emailVerificationTime) {
      throw new Error("Please verify your email before logging in.");
    }

    // @ts-ignore - Bypassing TypeScript error due to Convex code generation issue
    const session = await ctx.auth.createSession(user);
    return session;
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