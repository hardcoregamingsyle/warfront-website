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
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, { email, password }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

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
    const existingUserByName = await ctx.db
      .query("users")
      .withIndex("by_name_for_uniqueness", (q) => q.eq("name", name))
      .first();

    if (existingUserByName) {
      throw new Error("This Username is already in use");
    }

    if (email !== "hardcorgamingstyle@gmail.com") {
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
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

export const findDuplicateUsers = query({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();
    const usersByName = new Map<string, (typeof allUsers[0])[]>();

    for (const user of allUsers) {
      const lowerCaseName = user.name.toLowerCase();
      if (!usersByName.has(lowerCaseName)) {
        usersByName.set(lowerCaseName, []);
      }
      usersByName.get(lowerCaseName)!.push(user);
    }

    const duplicates: (typeof allUsers[0])[][] = [];
    for (const [name, users] of usersByName.entries()) {
      if (users.length > 1) {
        duplicates.push(users);
      }
    }

    return duplicates;
  },
});