import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { validateSession } from "./helpers/auth";

export const getForCurrentUser = query({
  args: { cardId: v.id("cards"), token: v.optional(v.string()) },
  handler: async (ctx, { cardId, token }) => {
    if (!token) return null;

    const session = await validateSession(ctx, token);
    if (!session) return null;

    return await ctx.db
      .query("userCards")
      .withIndex("by_user_card", (q) =>
        q.eq("userId", session.userId).eq("cardId", cardId)
      )
      .unique();
  },
});

export const addWithClaimCode = mutation({
  args: {
    cardId: v.id("cards"),
    claimCode: v.string(),
    token: v.string(),
  },
  handler: async (ctx, { cardId, claimCode, token }) => {
    const session = await validateSession(ctx, token);
    if (!session) {
      return { success: false, message: "User not authenticated." };
    }

    const [currentUser, card] = await Promise.all([
      ctx.db.get(session.userId),
      ctx.db.get(cardId),
    ]);

    if (!currentUser) {
      return { success: false, message: "User not found." };
    }

    if (!card) {
      return { success: false, message: "Card not found." };
    }

    if (!card.claimCode || card.claimCode !== claimCode) {
      return { success: false, message: "Invalid claim code." };
    }

    if (card.isClaimed) {
      return {
        success: false,
        message:
          "This claim code has already been used. Cards can only be claimed once.",
      };
    }

    const existingOwnership = await ctx.db
      .query("userCards")
      .withIndex("by_user_card", (q) =>
        q.eq("userId", session.userId).eq("cardId", cardId)
      )
      .unique();

    if (existingOwnership) {
      return { success: false, message: "Card already in your inventory." };
    }

    await ctx.db.patch(cardId, { isClaimed: true });
    await ctx.db.insert("userCards", {
      userId: session.userId,
      cardId,
    });

    return { success: true, message: "Card successfully claimed!" };
  },
});

export const add = mutation({
  args: { cardId: v.id("cards"), token: v.string() },
  handler: async (ctx, { cardId, token }) => {
    return {
      success: false,
      message:
        "Please use the claim code to add this card to your inventory.",
    };
  },
});

export const getInventory = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, { token }) => {
    if (!token) return [];

    const session = await validateSession(ctx, token);
    if (!session) return [];

    const userCards = await ctx.db
      .query("userCards")
      .withIndex("by_userId", (q) => q.eq("userId", session.userId))
      .collect();

    const cards = await Promise.all(
      userCards.map(async (userCard) => {
        const card = await ctx.db.get(userCard.cardId);
        if (!card) return null;

        const imageUrl = card.imageId
          ? await ctx.storage.getUrl(card.imageId)
          : null;

        return {
          ...card,
          imageUrl,
        };
      })
    );

    return cards.filter(
      (card): card is NonNullable<typeof card> => card !== null
    );
  },
});