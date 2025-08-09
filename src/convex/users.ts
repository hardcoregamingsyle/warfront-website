import { internal } from "./_generated/api";
import {
  action,
  internalMutation,
  mutation,
  query,
  QueryCtx,
} from "./_generated/server";
import { v } from "convex/values";
import { ROLES } from "./schema";
import * as bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

const SESSION_DURATION = 1000 * 60 * 60 * 24 * 7; // 7 days

async function getUserFromSession(ctx: QueryCtx, token?: string) {
  if (!token) return null;

  const userSession = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .unique();

  if (!userSession || userSession.expires < Date.now()) {
    return null;
  }

  return await ctx.db.get(userSession.userId);
}

export const currentUser = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, { token }) => {
    return await getUserFromSession(ctx, token);
  },
});

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
      console.log("Starting signup for:", args.email);

      console.log("Checking for existing user by email...");
      const existingUserByEmail = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", args.email))
        .unique();

      if (existingUserByEmail) {
        console.log("User with this email already exists.");
        throw new Error("An account with this email already exists.");
      }
      console.log("No existing user with this email.");

      console.log("Checking for existing user by username...");
      const existingUserByUsername = await ctx.db
        .query("users")
        .withIndex("username", (q) => q.eq("username", args.username))
        .unique();

      if (existingUserByUsername) {
        console.log("User with this username already exists.");
        throw new Error("This username is already taken.");
      }
      console.log("No existing user with this username.");

      console.log("Checking for pending user...");
      const existingPendingUser = await ctx.db
        .query("pendingUsers")
        .withIndex("email", (q) => q.eq("email", args.email))
        .unique();

      if (existingPendingUser) {
        console.log("Deleting existing pending user.");
        await ctx.db.delete(existingPendingUser._id);
      }
      console.log("No pending user found or deleted.");

      console.log("Hashing password...");
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(args.password, salt);
      console.log("Password hashed.");

      console.log("Generating OTP...");
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
      console.log("OTP generated.");

      console.log("Inserting into pendingUsers...");
      await ctx.db.insert("pendingUsers", {
        ...args,
        password: hashedPassword,
        otp,
        otpExpires,
      });
      console.log("Inserted into pendingUsers.");

      console.log("Scheduling OTP email...");
      await ctx.scheduler.runAfter(0, internal.auth_actions.sendOtpEmail, {
        email: args.email,
        otp,
      });
      console.log("OTP email scheduled. Signup process successful.");
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

export const login = mutation({
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

    // Create session
    const token = nanoid();
    const expires = Date.now() + SESSION_DURATION;

    await ctx.db.insert("sessions", {
      userId: user._id,
      token,
      expires,
    });

    return token;
  },
});

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});