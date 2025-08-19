import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

// Check if the current logged-in user has a specific card
export const getForCurrentUser = query({
    args: { cardId: v.id("cards") },
    handler: async (ctx, { cardId }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            return null; // Not logged in, so can't have the card
        }

        const userCard = await ctx.db
            .query("userCards")
            .withIndex("by_user_card", (q) =>
                q.eq("userId", userId).eq("cardId", cardId)
            )
            .unique();

        return userCard; // Returns the document if found, otherwise null
    },
});

// Add a card to the current user's inventory
export const add = mutation({
    args: { cardId: v.id("cards"), token: v.string() }, // Keep token for compatibility with CardViewer
    handler: async (ctx, { cardId, token }) => {
        // Auth check via token, maintaining existing pattern
        const session = await ctx.db
            .query("sessions")
            .withIndex("by_token", (q) => q.eq("token", token))
            .unique();

        if (!session || session.expires < Date.now()) {
            return { success: false, message: "User not authenticated." };
        }
        const userId = session.userId;

        // Check if the user already has the card
        const existingUserCard = await ctx.db
            .query("userCards")
            .withIndex("by_user_card", (q) =>
                q.eq("userId", userId).eq("cardId", cardId)
            )
            .unique();

        if (existingUserCard) {
            return { success: false, message: "Card already in inventory." };
        }

        // Add the card to the user's inventory
        await ctx.db.insert("userCards", {
            userId,
            cardId,
        });

        return { success: true, message: "Card added to inventory!" };
    },
});