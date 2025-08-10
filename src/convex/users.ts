import { internal } from "./_generated/api";
import {
  action,
  internalMutation,
  internalQuery,
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

export const _getSignupChecks = internalQuery({
  args: { email: v.string(), username: v.string() },
  handler: async (ctx, { email, username }) => {
    const existingUserByEmail = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .unique();

    const existingUserByUsername = await ctx.db
      .query("users")
      .withIndex("username", (q) => q.eq("username", username))
      .unique();

    const existingPendingUser = await ctx.db
      .query("pendingUsers")
      .withIndex("email", (q) => q.eq("email", email))
      .unique();

    return {
      existingUserByEmail,
      existingUserByUsername,
      existingPendingUser,
    };
  },
});

export const _clearAndCreatePendingUser = internalMutation({
  args: {
    userData: v.object({
      username: v.string(),
      email: v.string(),
      password: v.string(), // Hashed
      gender: v.optional(v.string()),
      dob: v.optional(v.string()),
      region: v.optional(v.string()),
    }),
    otp: v.string(),
    otpExpires: v.number(),
    userToDelete: v.optional(v.id("users")),
    pendingUserToDelete: v.optional(v.id("pendingUsers")),
  },
  handler: async (
    ctx,
    { userData, otp, otpExpires, userToDelete, pendingUserToDelete },
  ) => {
    if (userToDelete) {
      await ctx.db.delete(userToDelete);
    }
    if (pendingUserToDelete) {
      await ctx.db.delete(pendingUserToDelete);
    }

    await ctx.db.insert("pendingUsers", {
      ...userData,
      otp,
      otpExpires,
    });
  },
});

export const startSignup = action({
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

      const {
        existingUserByEmail,
        existingUserByUsername,
        existingPendingUser,
      } = await ctx.runQuery(internal.users._getSignupChecks, {
        email: args.email,
        username: args.username,
      });

      if (existingUserByEmail) {
        if (existingUserByEmail.emailVerificationTime) {
          console.log("User with this email already exists and is verified.");
          throw new Error(
            "An account with this email already exists. Please log in.",
          );
        }
      }

      if (existingUserByUsername) {
        console.log("User with this username already exists.");
        throw new Error("This username is already taken.");
      }

      console.log("Hashing password...");
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(args.password, salt);
      console.log("Password hashed.");

      console.log("Generating OTP...");
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
      console.log("OTP generated.");

      console.log("Clearing old entries and inserting into pendingUsers...");
      await ctx.runMutation(internal.users._clearAndCreatePendingUser, {
        userData: {
          ...args,
          password: hashedPassword,
        },
        otp,
        otpExpires,
        userToDelete: existingUserByEmail?._id,
        pendingUserToDelete: existingPendingUser?._id,
      });
      console.log("Inserted into pendingUsers.");

      console.log("Scheduling OTP email...");
      await ctx.scheduler.runAfter(0, internal.auth_actions.sendOtpEmail, {
        email: args.email,
        otp,
      });
      console.log("OTP email scheduled. Signup process successful.");
    } catch (error: any) {
      console.error("Error in startSignup action:", error);
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
      emailVerificationTime: Date.now(), // Mark email as verified
      twoFactorEnabled: false,
    });

    await ctx.db.delete(pendingUser._id);

    const token = nanoid();
    const expires = Date.now() + SESSION_DURATION;

    await ctx.db.insert("sessions", {
      userId: userId,
      token,
      expires,
    });

    return { token };
  },
});

// This is an internal helper query, not exposed to the client directly.
export const _getUserByIdentifier = internalQuery({
  args: { identifier: v.string() },
  handler: async (ctx, { identifier }) => {
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

    return user;
  },
});

// This is an internal helper mutation, not exposed to the client directly.
export const _createSession = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const token = nanoid();
    const expires = Date.now() + SESSION_DURATION;

    await ctx.db.insert("sessions", {
      userId: userId,
      token,
      expires,
    });

    return token;
  },
});

export const verifyPassword = action({
  args: {
    identifier: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { identifier, password }): Promise<{email: string, twoFactorEnabled: boolean}> => {
    const user = await ctx.runQuery(internal.users._getUserByIdentifier, {
      identifier,
    });

    if (!user) {
      throw new Error("User not found.");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new Error("Incorrect password.");
    }

    // Return email for the next step (OTP) and 2FA status
    return {
      email: user.email!,
      twoFactorEnabled: user.twoFactorEnabled ?? false,
    };
  },
});

export const login = action({
  args: {
    identifier: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { identifier, password }): Promise<string> => {
    const user = await ctx.runQuery(internal.users._getUserByIdentifier, {
      identifier,
    });

    if (!user) {
      throw new Error("User not found.");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new Error("Incorrect password.");
    }

    const token = await ctx.runMutation(internal.users._createSession, {
      userId: user._id,
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