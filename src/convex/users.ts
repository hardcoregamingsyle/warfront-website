import { query, internalQuery, mutation, action } from "./_generated/server";
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

export const login = action({
    args: { identifier: v.string(), password: v.string() },
    handler: async (ctx, args) => {
        // This is a placeholder - the actual auth should use Convex Auth
        throw new Error("Please use the email OTP authentication system instead");
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