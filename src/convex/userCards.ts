import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Helper to get user from token
const getUserFromToken = async (ctx: any, token: string) => {
    if (!token) {
        return null;
    }
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q: any) => q.eq("token", token))
      .unique();

    if (!session || session.expires < Date.now()) {
      return null;
    }
    return await ctx.db.get(session.userId);
};

export const add = mutation({
    args: {
        cardId: v.id("cards"),
        token: v.string(),
    },
    handler: async (ctx, { cardId, token }) => {
        const user = await getUserFromToken(ctx, token);
        if (!user) {
            throw new Error("User not authenticated");
        }

        // Check if card exists
        const card = await ctx.db.get(cardId);
        if (!card) {
            throw new Error("Card not found");
        }

        // Check if user already has this card
        const existingUserCard = await ctx.db
            .query("userCards")
            .withIndex("by_user_card", (q) =>
                q.eq("userId", user._id).eq("cardId", cardId)
            )
            .unique();

        if (existingUserCard) {
            // Card already in inventory
            return { success: false, message: "Card already in inventory." };
        }

        await ctx.db.insert("userCards", {
            userId: user._id,
            cardId: cardId,
        });

        return { success: true, message: "Card added to inventory." };
    },
});

export const getForUser = query({
    args: { token: v.string() },
    handler: async (ctx, { token }) => {
        const user = await getUserFromToken(ctx, token);
        if (!user) {
            return [];
        }

        const userCards = await ctx.db
            .query("userCards")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .collect();

        return Promise.all(
            userCards.map(async (userCard) => {
                return await ctx.db.get(userCard.cardId);
            })
        );
    },
});
