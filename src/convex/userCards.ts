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

// Add a card to the current user's inventory using a claim code
export const addWithClaimCode = mutation({
    args: { 
      cardId: v.id("cards"), 
      claimCode: v.string(),
      token: v.string() 
    },
    handler: async (ctx, { cardId, claimCode, token }) => {
        const session = await ctx.db
            .query("sessions")
            .withIndex("by_token", (q) => q.eq("token", token))
            .unique();

        if (!session || session.expires < Date.now()) {
            return { success: false, message: "User not authenticated." };
        }

        const currentUser = await ctx.db.get(session.userId);
        if (!currentUser) {
            return { success: false, message: "User not found." };
        }

        const card = await ctx.db.get(cardId);
        if (!card) {
            return { success: false, message: "Card not found." };
        }

        // Verify claim code
        if (!card.claimCode || card.claimCode !== claimCode) {
            return { success: false, message: "Invalid claim code." };
        }

        // Check if card has already been claimed (one-time use)
        if (card.isClaimed) {
            return { success: false, message: "This claim code has already been used. Cards can only be claimed once." };
        }

        // Check if user already owns this card
        const existingOwnership = await ctx.db
            .query("userCards")
            .withIndex("by_user_card", (q) => 
                q.eq("userId", session.userId).eq("cardId", cardId)
            )
            .unique();

        if (existingOwnership) {
            return { success: false, message: "Card already in your inventory." };
        }

        // Mark card as claimed permanently (one-time use)
        await ctx.db.patch(cardId, { isClaimed: true });
        
        // Add to user's inventory
        await ctx.db.insert("userCards", {
            userId: session.userId,
            cardId,
        });

        return { success: true, message: "Card successfully claimed!" };
    },
});

// Keep the old add mutation for backward compatibility but mark it as deprecated
export const add = mutation({
    args: { cardId: v.id("cards"), token: v.string() },
    handler: async (ctx, { cardId, token }) => {
        return { 
          success: false, 
          message: "Please use the claim code to add this card to your inventory." 
        };
    },
});

// Get all cards in the current user's inventory
export const getInventory = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, { token }) => {
    if (!token) {
      return [];
    }

    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (!session || session.expires < Date.now()) {
      return [];
    }

    const userCards = await ctx.db
      .query("userCards")
      .withIndex("by_userId", (q) => q.eq("userId", session.userId))
      .collect();

    const cards = await Promise.all(
      userCards.map(async (userCard) => {
        const card = await ctx.db.get(userCard.cardId);
        if (!card) return null;
        
        // Get the image URL if imageId exists
        const imageUrl = card.imageId ? await ctx.storage.getUrl(card.imageId) : null;
        
        return {
          ...card,
          imageUrl
        };
      })
    );

    // Filter out nulls if a card was deleted but the userCard entry wasn't
    return cards.filter((card): card is NonNullable<typeof card> => card !== null);
  },
});