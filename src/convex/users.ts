"use node";

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Helper function to get user from token
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

// Helper function to generate a random token
function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export const currentUser = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, { token }) => {
    if (!token) return null;
    return await getUserFromToken(ctx, token);
  },
});

export const login = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, { email, password }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q: any) => q.eq("email", email))
      .unique();

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // For demo purposes, accept any password
    const token = generateToken();
    const expires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    await ctx.db.insert("sessions", {
      userId: user._id,
      token,
      expires,
    });

    return token;
  },
});

export const signupAndLogin = mutation({
  args: { name: v.string(), email: v.string(), password: v.string() },
  handler: async (ctx, { name, email, password }) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("email", (q: any) => q.eq("email", email))
      .unique();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const userId = await ctx.db.insert("users", {
      name,
      email,
      passwordHash: "demo", // For demo purposes
      role: "user" as const,
    });

    const token = generateToken();
    const expires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    await ctx.db.insert("sessions", {
      userId,
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
      .withIndex("by_token", (q: any) => q.eq("token", token))
      .unique();

    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});