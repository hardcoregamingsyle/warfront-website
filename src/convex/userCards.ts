import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Check if the current logged-in user has a specific card
export const getForCurrentUser = query({
    args: { cardId: v.id("cards"), token: v.optional(v.string()) },
    handler: async (ctx, { cardId, token }) => {
        if (!token) {
            return null; // Not logged in, so can't have the card
        }

        const session = await ctx.db
            .query("sessions")
            .withIndex("by_token", (q) => q.eq("token", token))
            .unique();

        if (!session || session.expires < Date.now()) {
            return null;
        }

        const userCard = await ctx.db
            .query("userCards")
            .withIndex("by_user_card", (q) =>
                q.eq("userId", session.userId).eq("cardId", cardId)
            )
            .unique();

        return userCard; // Returns the document if found, otherwise null
    },
});

// Add a card to the current user's inventory
export const add = mutation({
    args: { cardId: v.id("cards"), token: v.string() },
    handler: async (ctx, { cardId, token }) => {
        const session = await ctx.db
            .query("sessions")
            .withIndex("by_token", (q) => q.eq("token", token))
            .unique();

        if (!session || session.expires < Date.now()) {
            return { success: false, message: "User not authenticated." };
        }

        // Check if the user already has the card
        const existingUserCard = await ctx.db
            .query("userCards")
            .withIndex("by_user_card", (q) =>
                q.eq("userId", session.userId).eq("cardId", cardId)
            )
            .unique();

        if (existingUserCard) {
            return { success: false, message: "Card already in inventory." };
        }

        // Add the card to the user's inventory
        await ctx.db.insert("userCards", {
            userId: session.userId,
            cardId,
        });

        return { success: true, message: "Card added to inventory!" };
    },
});