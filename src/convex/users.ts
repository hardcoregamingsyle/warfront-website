import { v } from "convex/values";
import {
  mutation,
  query,
} from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Simple hash function for demo purposes - not secure for production
const FAKE_HASH_SALT = "this-is-not-secure-and-should-be-in-an-env-var";
const hashPassword = (password: string) => {
  // Simple string hash for demo - use proper bcrypt in production
  let hash = 0;
  const str = password + FAKE_HASH_SALT;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
};

const generateToken = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Get user from session token
export const currentUser = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, { token }) => {
    if (!token) {
      return null;
    }
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (!session || session.expires < Date.now()) {
      return null;
    }

    return await ctx.db.get(session.userId);
  },
});

export const login = mutation({
  args: { identifier: v.string(), password: v.string() },
  handler: async (ctx, { identifier, password }) => {
    const lowerIdentifier = identifier.toLowerCase();
    let user;

    if (lowerIdentifier.includes("@")) {
      if (lowerIdentifier === "hardcorgamingstyle@gmail.com") {
        throw new Error(
          "Please log in with your username, as this email is associated with multiple accounts.",
        );
      }
      user = await ctx.db
        .query("users")
        .withIndex("by_email_normalized", (q) =>
          q.eq("email_normalized", lowerIdentifier),
        )
        .unique();
    } else {
      user = await ctx.db
        .query("users")
        .withIndex("by_name_normalized", (q) =>
          q.eq("name_normalized", lowerIdentifier),
        )
        .unique();
    }

    if (!user) {
      throw new Error("Incorrect Username or Password");
    }

    const passwordHash = hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      throw new Error("Incorrect Username or Password");
    }

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
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { name, email, password }) => {
    const lowerName = name.toLowerCase();
    const lowerEmail = email.toLowerCase();

    const existingUserByName = await ctx.db
      .query("users")
      .withIndex("by_name_normalized", (q) => q.eq("name_normalized", lowerName))
      .first();

    if (existingUserByName) {
      throw new Error("This Username is already in use");
    }

    if (lowerEmail !== "hardcorgamingstyle@gmail.com") {
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_email_normalized", (q) =>
          q.eq("email_normalized", lowerEmail),
        )
        .first();

      if (existingUser) {
        throw new Error("This Email is already in use");
      }
    }

    const passwordHash = hashPassword(password);

    const userId = await ctx.db.insert("users", {
      name,
      email,
      passwordHash,
      role: "user" as const,
      name_normalized: lowerName,
      email_normalized: lowerEmail,
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
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});

export const getUserProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    // Return a public-safe user object
    return {
      _id: user._id,
      name: user.name,
      image: user.image,
    };
  },
});

export const searchUsers = query({
  args: { search: v.string() },
  handler: async (ctx, { search }) => {
    if (!search) {
      return [];
    }
    const users = await ctx.db
      .query("users")
      .withSearchIndex("by_name", (q) => q.search("name", search))
      .take(10); // Limit to 10 results

    return users.map((user) => ({
      _id: user._id,
      name: user.name,
      image: user.image,
    }));
  },
});

export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    // First, find and delete any sessions associated with the user
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }

    // Now, delete the user
    await ctx.db.delete(userId);
    return "User deleted successfully";
  },
});