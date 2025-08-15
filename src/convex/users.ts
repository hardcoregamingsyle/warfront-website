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

    return {
      existingUserByEmail,
      existingUserByUsername,
    };
  },
});

export const _createUserAndSession = internalMutation({
  args: {
    userData: v.object({
      username: v.string(),
      email: v.string(),
      password: v.string(), // Hashed
      gender: v.optional(v.string()),
      dob: v.optional(v.string()),
      region: v.optional(v.string()),
      role: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { userData }) => {
    const userId = await ctx.db.insert("users", {
      ...userData,
      name: userData.username,
      role: userData.role === "admin" ? ROLES.ADMIN : ROLES.USER,
      emailVerificationTime: Date.now(), // Mark email as verified immediately
      twoFactorEnabled: false,
    });

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

export const signupAndLogin = action({
  args: {
    username: v.string(),
    email: v.string(),
    password: v.string(),
    gender: v.optional(v.string()),
    dob: v.optional(v.string()),
    region: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ token: string }> => {
    try {
      const { existingUserByEmail, existingUserByUsername } =
        await ctx.runQuery(internal.users._getSignupChecks, {
          email: args.email,
          username: args.username,
        });

      if (existingUserByEmail) {
        throw new Error(
          "An account with this email already exists. Please log in.",
        );
      }

      if (existingUserByUsername) {
        throw new Error("This username is already taken.");
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(args.password, salt);

      const { token } = await ctx.runMutation(
        internal.users._createUserAndSession,
        {
          userData: {
            ...args,
            password: hashedPassword,
          },
        },
      );

      return { token };
    } catch (error: any) {
      console.error("Error in signup action:", error);
      throw new Error(
        error.message || "An unknown error occurred during signup.",
      );
    }
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

export const _updateUserPassword = internalMutation({
    args: { userId: v.id("users"), hashedPassword: v.string() },
    handler: async (ctx, { userId, hashedPassword }) => {
        await ctx.db.patch(userId, { password: hashedPassword });
    },
});