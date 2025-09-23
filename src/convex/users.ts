import { v, ConvexError } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { roleValidator, ROLES } from "./schema";
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

export const verifyUserEmail = mutation({
    args: { token: v.string() },
    handler: async (ctx, { token }) => {
        const verificationRecord = await ctx.db
            .query("verificationTokens")
            .withIndex("by_token", (q) => q.eq("token", token))
            .unique();

        if (!verificationRecord) {
            // This can happen if the user clicks the link twice (and the token is deleted)
            // or the token is invalid. We can't distinguish, so we give a generic error.
            throw new Error("This verification link is invalid or has already been used.");
        }

        if (verificationRecord.expires < Date.now()) {
            await ctx.db.delete(verificationRecord._id);
            throw new Error("This verification link has expired. Please request a new one.");
        }

        const user = await ctx.db.get(verificationRecord.userId);
        if (!user) {
            // This should not happen if the token is valid, but we check just in case.
            throw new Error("User for this token not found. The account may have been deleted.");
        }

        // If user is already verified, we can just let them know.
        if (user.emailVerified) {
            await ctx.db.delete(verificationRecord._id); // Clean up the used token
            return "This email address has already been verified.";
        }

        // Update user role to Verified
        await ctx.db.patch(user._id, { role: ROLES.VERIFIED, emailVerified: true });

        // Delete the token so it can't be used again
        await ctx.db.delete(verificationRecord._id);

        return "Email verified successfully! You can now log in.";
    },
});

export const login = mutation({
  args: { identifier: v.string(), password: v.string() },
  handler: async (ctx, { identifier, password }) => {
    const lowerIdentifier = identifier.toLowerCase();
    let user;

    if (lowerIdentifier.includes("@")) {
      if (lowerIdentifier === "hardcorgamingstyle@gmail.com") {
        // Use ConvexError so frontend receives message in error.data
        throw new ConvexError(
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
      throw new ConvexError("Incorrect Username or Password");
    }

    const passwordHash = hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      throw new ConvexError("Incorrect Username or Password");
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

    // For regular users, create user and send verification email
    const userId = await ctx.db.insert("users", {
      name,
      email,
      passwordHash,
      role: ROLES.UNVERIFIED, // Start as unverified
      name_normalized: name.toLowerCase(),
      email_normalized: email.toLowerCase(),
      region,
      emailVerified: false, // Not verified yet
    });

    const verificationToken = generateToken();
    const tokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await ctx.db.insert("verificationTokens", {
      userId,
      token: verificationToken,
      expires: tokenExpires,
    });

    await ctx.scheduler.runAfter(0, internal.auth_actions.sendVerificationEmail, {
        email,
        name,
        token: verificationToken,
    });

    // Create a session for the new user so they are logged in
    const sessionToken = generateToken();
    const sessionExpires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    await ctx.db.insert("sessions", {
      userId,
      token: sessionToken,
      expires: sessionExpires,
    });

    return sessionToken;
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

export const resendVerificationEmail = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (!session) {
      throw new Error("Invalid session. Please log in again.");
    }

    const user = await ctx.db.get(session.userId);

    if (!user) {
      throw new Error("User not found.");
    }

    if (user.role !== ROLES.UNVERIFIED) {
      throw new Error("This account is already verified.");
    }

    // Invalidate old tokens by deleting them
    const existingTokens = await ctx.db
      .query("verificationTokens")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    for (const tokenDoc of existingTokens) {
      await ctx.db.delete(tokenDoc._id);
    }

    // Create a new token
    const verificationToken = generateToken();
    const tokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await ctx.db.insert("verificationTokens", {
      userId: user._id,
      token: verificationToken,
      expires: tokenExpires,
    });

    // Send the email
    await ctx.scheduler.runAfter(0, internal.auth_actions.sendVerificationEmail, {
        email: user.email,
        name: user.name,
        token: verificationToken,
    });

    return "Verification email sent successfully.";
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

export const getOldUnverifiedUsers = internalQuery({
    args: { creationTime: v.number() },
    handler: async (ctx, { creationTime }) => {
        return await ctx.db
            .query("users")
            .withIndex("by_role", (q) => q.eq("role", ROLES.UNVERIFIED))
            .filter((q) => q.lt(q.field("_creationTime"), creationTime))
            .collect();
    }
});

export const internalDeleteUser = internalMutation({
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
    dob: v.optional(v.string()),
    image: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, { token, username, displayName, region, dob, image, storageId }) => {
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
    if (dob !== undefined) {
      updates.dob = dob;
    }
    if (image !== undefined) {
      updates.image = image;
    }

    if (storageId) {
      const imageUrl = await ctx.storage.getUrl(storageId);
      updates.image = imageUrl;
    } else if (image !== undefined) {
      updates.image = image;
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
      image: user.image,
      dob: user.dob,
      // Add role and emailVerified so the UI can decide whether to show Role control
      role: user.role,
      emailVerified: user.emailVerified,
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

export const requestPasswordReset = mutation({
  args: { identifier: v.string() },
  handler: async (ctx, { identifier }) => {
    const lowerIdentifier = identifier.toLowerCase();
    let user;

    // Check if identifier is email or username
    if (lowerIdentifier.includes("@")) {
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
      // Don't reveal if user exists or not for security
      return "If an account with that email/username exists, a password reset link has been sent.";
    }

    // Delete any existing password reset tokens for this user
    const existingTokens = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    for (const token of existingTokens) {
      await ctx.db.delete(token._id);
    }

    // Create new password reset token
    const resetToken = generateToken();
    const tokenExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    await ctx.db.insert("passwordResetTokens", {
      userId: user._id,
      token: resetToken,
      expires: tokenExpires,
    });

    // Send password reset email
    await ctx.scheduler.runAfter(0, internal.auth_actions.sendPasswordResetEmail, {
      email: user.email,
      name: user.name,
      token: resetToken,
    });

    return "If an account with that email/username exists, a password reset link has been sent.";
  },
});

export const resetPassword = mutation({
  args: { token: v.string(), newPassword: v.string() },
  handler: async (ctx, { token, newPassword }) => {
    const resetRecord = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (!resetRecord) {
      throw new Error("This password reset link is invalid or has already been used.");
    }

    if (resetRecord.expires < Date.now()) {
      await ctx.db.delete(resetRecord._id);
      throw new Error("This password reset link has expired. Please request a new one.");
    }

    const user = await ctx.db.get(resetRecord.userId);
    if (!user) {
      throw new Error("User not found.");
    }

    // Update password
    const passwordHash = hashPassword(newPassword);
    await ctx.db.patch(user._id, { passwordHash });

    // Delete the reset token
    await ctx.db.delete(resetRecord._id);

    // Delete all sessions to force re-login
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }

    return "Password reset successfully. Please log in with your new password.";
  },
});