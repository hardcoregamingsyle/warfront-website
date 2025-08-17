import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { roleValidator } from "./schema";
import { internal } from "./_generated/api";

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

export const getVerificationToken = internalQuery({
    args: { token: v.string() },
    handler: async (ctx, { token }) => {
        return await ctx.db
            .query("verificationTokens")
            .withIndex("by_token", (q) => q.eq("token", token))
            .unique();
    },
});

export const verifyEmail = internalMutation({
    args: { userId: v.id("users"), tokenId: v.id("verificationTokens") },
    handler: async (ctx, { userId, tokenId }) => {
        await ctx.db.patch(userId, { emailVerified: true });
        await ctx.db.delete(tokenId);
    },
});

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
        .first();
    } else {
      user = await ctx.db
        .query("users")
        .withIndex("by_name_normalized", (q) =>
          q.eq("name_normalized", lowerIdentifier),
        )
        .first();
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
    region: v.string(),
  },
  handler: async (ctx, { name, email, password, region }) => {
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
      region,
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
      displayName: user.displayName,
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

export const deleteDuplicateUsers = mutation({
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").order("asc").collect();
    const seenNames = new Map<string, Id<"users">>();
    const seenEmails = new Map<string, Id<"users">>();
    const usersToDelete: Id<"users">[] = [];
    let deletedCount = 0;

    for (const user of allUsers) {
      // Check for duplicate names
      if (user.name_normalized) {
        if (seenNames.has(user.name_normalized)) {
          usersToDelete.push(user._id);
          continue; // Skip to next user, as this one is marked for deletion
        }
        seenNames.set(user.name_normalized, user._id);
      }

      // Check for duplicate emails
      if (user.email_normalized) {
        if (seenEmails.has(user.email_normalized)) {
          usersToDelete.push(user._id);
          continue;
        }
        seenEmails.set(user.email_normalized, user._id);
      }
    }

    const uniqueUsersToDelete = [...new Set(usersToDelete)];

    for (const userId of uniqueUsersToDelete) {
        // Also delete associated sessions
        const sessions = await ctx.db
            .query("sessions")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .collect();
        for (const session of sessions) {
            await ctx.db.delete(session._id);
        }
        await ctx.db.delete(userId);
        deletedCount++;
    }

    return `Deleted ${deletedCount} duplicate users.`;
  },
});

export const updateAccountSettings = mutation({
  args: {
    token: v.string(),
    username: v.optional(v.string()),
    displayName: v.optional(v.string()),
    region: v.optional(v.string()),
    password: v.string(),
  },
  handler: async (ctx, { token, username, displayName, region, password }) => {
    // Get current user from token
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (!session || session.expires < Date.now()) {
      throw new Error("Invalid or expired session");
    }

    const user = await ctx.db.get(session.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Verify password
    const passwordHash = hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      throw new Error("Incorrect password");
    }

    // Check if username is already taken (if changing username)
    if (username && username.toLowerCase() !== user.name_normalized) {
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_name_normalized", (q) => 
          q.eq("name_normalized", username.toLowerCase())
        )
        .first();

      if (existingUser) {
        throw new Error("Username is already taken");
      }
    }

    // Update user
    const updates: any = {};
    if (username) {
      updates.name = username;
      updates.name_normalized = username.toLowerCase();
    }
    if (displayName !== undefined) {
      updates.displayName = displayName;
    }
    if (region !== undefined) {
      updates.region = region;
    }

    await ctx.db.patch(user._id, updates);
    return "Account settings updated successfully";
  },
});

export const getCurrentUserSettings = query({
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

    const user = await ctx.db.get(session.userId);
    if (!user) {
      return null;
    }

    return {
      _id: user._id,
      name: user.name,
      displayName: user.displayName,
      region: user.region,
      email: user.email,
    };
  },
});

export const migrateAndCleanUserDuplicates = mutation({
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();
    let patchedCount = 0;

    // Step 1: Ensure all users have a correct `name_normalized` field.
    for (const user of allUsers) {
      const expectedNormalized = user.name.toLowerCase();
      if (user.name_normalized !== expectedNormalized) {
        await ctx.db.patch(user._id, { name_normalized: expectedNormalized });
        patchedCount++;
      }
    }

    // Step 2: Now that data is consistent, run duplicate deletion.
    const freshUsers = await ctx.db.query("users").order("asc").collect();
    const seenNames = new Map<string, Id<"users">>();
    const usersToDelete: Id<"users">[] = [];
    let deletedCount = 0;

    for (const user of freshUsers) {
      if (user.name_normalized) {
        if (seenNames.has(user.name_normalized)) {
          usersToDelete.push(user._id);
        } else {
          seenNames.set(user.name_normalized, user._id);
        }
      }
    }
    
    const uniqueUsersToDelete = [...new Set(usersToDelete)];

    for (const userId of uniqueUsersToDelete) {
        const sessions = await ctx.db
            .query("sessions")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .collect();
        for (const session of sessions) {
            await ctx.db.delete(session._id);
        }
        await ctx.db.delete(userId);
        deletedCount++;
    }

    return `Patched ${patchedCount} users. Deleted ${deletedCount} duplicate users.`;
  },
});

export const setUserRole = mutation({
  args: { token: v.string(), role: roleValidator },
  handler: async (ctx, { token, role }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (!session || session.expires < Date.now()) {
      throw new Error("Invalid or expired session");
    }

    const user = await ctx.db.get(session.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Only allow role assignment for admin email
    if (user.email_normalized !== "hardcorgamingstyle@gmail.com") {
      throw new Error("Role assignment not allowed for this account");
    }

    await ctx.db.patch(user._id, { role });
    return "Role assigned successfully";
  },
});