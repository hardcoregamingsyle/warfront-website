import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { mutation, query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { ROLES } from "./schema";
import * as bcrypt from "bcryptjs";

/**
 * Get the current signed in user. Returns null if the user is not signed in.
 * THIS FUNCTION IS READ-ONLY. DO NOT MODIFY.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
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

export const startSignup = mutation({
  args: {
    username: v.string(),
    email: v.string(),
    password: v.string(),
    gender: v.optional(v.string()),
    dob: v.optional(v.string()),
    region: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const existingUserByEmail = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", args.email))
        .unique();

      if (existingUserByEmail) {
        throw new Error("An account with this email already exists.");
      }

      const existingUserByUsername = await ctx.db
        .query("users")
        .withIndex("username", (q) => q.eq("username", args.username))
        .unique();

      if (existingUserByUsername) {
        throw new Error("This username is already taken.");
      }

      const existingPendingUser = await ctx.db
        .query("pendingUsers")
        .withIndex("email", (q) => q.eq("email", args.email))
        .unique();

      if (existingPendingUser) {
        await ctx.db.delete(existingPendingUser._id);
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(args.password, salt);

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

      await ctx.db.insert("pendingUsers", {
        ...args,
        password: hashedPassword,
        otp,
        otpExpires,
      });

      await ctx.scheduler.runAfter(0, internal.auth_actions.sendOtpEmail, {
        email: args.email,
        otp,
      });
    } catch (error: any) {
      console.error("Error in startSignup mutation:", error);
      throw new Error(
        error.message || "An unknown error occurred during signup.",
      );
    }
  },
});

export const verifyOtpAndCreateUser = mutation({
  args: {
    email: v.string(),
    otp: v.string(),
  },
  handler: async (ctx, { email, otp }) => {
    const pendingUser = await ctx.db
      .query("pendingUsers")
      .withIndex("email", (q) => q.eq("email", email))
      .unique();

    if (!pendingUser) {
      throw new Error("No pending signup found for this email.");
    }

    if (pendingUser.otp !== otp) {
      throw new Error("Invalid OTP.");
    }

    if (Date.now() > pendingUser.otpExpires) {
      await ctx.db.delete(pendingUser._id);
      throw new Error("OTP has expired. Please try signing up again.");
    }

    const { _id, otp: _, otpExpires: __, ...userData } = pendingUser;

    const userId = await ctx.db.insert("users", {
      ...userData,
      name: userData.username,
      role: ROLES.USER,
      twoFactorEnabled: false,
    });

    await ctx.db.delete(pendingUser._id);

    return userId;
  },
});

export const verifyPassword = query({
  args: {
    identifier: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { identifier, password }) => {
    // Try to find user by email
    let user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identifier))
      .unique();

    // If not found, try to find by username
    if (!user) {
      user = await ctx.db
        .query("users")
        // This will throw an error if the `username` index doesn't exist.
        // I've already added it in `schema.ts`.
        .withIndex("username", (q) => q.eq("username", identifier))
        .unique();
    }

    if (!user) {
      throw new Error("User not found.");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new Error("Incorrect password.");
    }

    // Return email for the next step (OTP) and 2FA status
    return {
      email: user.email,
      twoFactorEnabled: user.twoFactorEnabled ?? false,
    };
  },
});