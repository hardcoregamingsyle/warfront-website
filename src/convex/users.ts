import { query, internalQuery, internalMutation, mutation, action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const emailExists = internalQuery({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("email", (q) => q.eq("email", args.email))
            .first();
        return !!user;
    },
});

export const currentUser = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        if (!args.token) return null;
        
        const session = await ctx.db
            .query("sessions")
            .withIndex("by_token", (q) => q.eq("token", args.token!))
            .unique();
            
        if (!session || session.expires < Date.now()) {
            return null;
        }
        
        return await ctx.db.get(session.userId);
    },
});

export const createUserAndSession = internalMutation({
    args: { email: v.string(), name: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const userId = await ctx.db.insert("users", {
            email: args.email,
            name: args.name || "User",
        });
        
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        await ctx.db.insert("sessions", {
            userId,
            token,
            expires: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
        });
        
        return token;
    },
});

export const loginUser = internalMutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("email", (q) => q.eq("email", args.email))
            .first();
            
        if (!user) {
            throw new Error("Invalid email or password.");
        }
        
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        await ctx.db.insert("sessions", {
            userId: user._id,
            token,
            expires: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
        });
        
        return token;
    },
});

export const signupAndLogin = action({
    args: { email: v.string(), password: v.string(), name: v.optional(v.string()) },
    handler: async (ctx, args): Promise<string> => {
        // Check email restriction
        if (args.email.toLowerCase() !== "hardcorgamingstyle@gmail.com") {
            const emailExists = await ctx.runQuery(internal.users.emailExists, { email: args.email });
            if (emailExists) {
                throw new Error("An account with this email already exists.");
            }
        }
        
        return await ctx.runMutation(internal.users.createUserAndSession, {
            email: args.email,
            name: args.name,
        });
    },
});

export const login = action({
    args: { email: v.string(), password: v.string() },
    handler: async (ctx, args): Promise<string> => {
        return await ctx.runMutation(internal.users.loginUser, { email: args.email });
    },
});

export const logout = mutation({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        const session = await ctx.db
            .query("sessions")
            .withIndex("by_token", (q) => q.eq("token", args.token))
            .unique();
            
        if (session) {
            await ctx.db.delete(session._id);
        }
    },
});