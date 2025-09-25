import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const get = query({
  args: { customId: v.string() },
  handler: async (ctx, { customId }) => {
    const card = await ctx.db
      .query("cards")
      .withIndex("by_customId", (q) => q.eq("customId", customId))
      .unique();
    
    if (!card) {
        return null;
    }

    const imageUrl = card.imageId ? await ctx.storage.getUrl(card.imageId) : null;

    return {
        ...card,
        imageUrl,
    }
  },
});

export const update = mutation({
  args: {
    cardId: v.id("cards"), // Use the real _id for patching
    cardType: v.string(),
    cardName: v.string(),
    imageId: v.optional(v.id("_storage")),
    rarity: v.optional(v.string()),
    frame: v.optional(v.string()),
    batch: v.optional(v.string()),
    numberingA: v.optional(v.number()),
    numberingB: v.optional(v.number()),
    signed: v.optional(v.string()),
    token: v.string(),
  },
  handler: async (ctx, { cardId, cardType, cardName, imageId, rarity, frame, batch, numberingA, numberingB, signed, token }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (!session || session.expires < Date.now()) {
      throw new Error("Invalid or expired session");
    }

    const user = await ctx.db.get(session.userId);
    if (!user || !["admin", "owner", "cardsetter"].includes(user.role!)) {
        throw new Error("Unauthorized");
    }

    await ctx.db.patch(cardId, {
      cardType,
      cardName,
      // keep the normalized name in sync
      name_normalized: cardName.toLowerCase(),
      imageId,
      rarity,
      frame,
      batch,
      numberingA,
      numberingB,
      signed,
    });
  },
});

export const deleteCard = mutation({
  args: { cardId: v.id("cards"), token: v.string() },
  handler: async (ctx, { cardId, token }) => {
    // Authorization
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (!session || session.expires < Date.now()) {
      throw new Error("Invalid or expired session");
    }

    const user = await ctx.db.get(session.userId);
    if (!user || !["admin", "owner", "cardsetter"].includes(user.role!)) {
      throw new Error("Unauthorized");
    }

    const card = await ctx.db.get(cardId);
    if (!card) {
      throw new Error("Card not found");
    }

    // Delete image from storage
    if (card.imageId) {
      await ctx.storage.delete(card.imageId);
    }

    // 1. Delete the card itself
    await ctx.db.delete(cardId);

    // 2. Find and delete all userCards associated with this card
    const userCardEntries = await ctx.db
      .query("userCards")
      .withIndex("by_cardId", (q) => q.eq("cardId", cardId))
      .collect();

    for (const entry of userCardEntries) {
      await ctx.db.delete(entry._id);
    }

    return { success: true };
  },
});

export const deleteAllCards = mutation({
    args: { token: v.string() },
    handler: async (ctx, { token }) => {
        // Authorization
        const session = await ctx.db
            .query("sessions")
            .withIndex("by_token", (q) => q.eq("token", token))
            .unique();

        if (!session || session.expires < Date.now()) {
            throw new Error("Invalid or expired session");
        }

        const user = await ctx.db.get(session.userId);
        if (!user || !["admin", "owner"].includes(user.role!)) {
            throw new Error("Unauthorized");
        }

        const allCards = await ctx.db.query("cards").collect();
        let deletedCount = 0;

        for (const card of allCards) {
            // Delete image from storage
            if (card.imageId) {
                await ctx.storage.delete(card.imageId);
            }
            
            // Delete the card itself
            await ctx.db.delete(card._id);

            // Find and delete all userCards associated with this card
            const userCardEntries = await ctx.db
                .query("userCards")
                .withIndex("by_cardId", (q) => q.eq("cardId", card._id))
                .collect();

            for (const entry of userCardEntries) {
                await ctx.db.delete(entry._id);
            }
            deletedCount++;
        }

        return { success: true, deletedCount };
    }
});

// This function creates a new card with a specific custom ID.
export const createCardWithId = mutation({
    args: { token: v.string(), customId: v.string() },
    handler: async (ctx, { token, customId }) => {
        const session = await ctx.db
          .query("sessions")
          .withIndex("by_token", (q) => q.eq("token", token))
          .unique();

        if (!session || session.expires < Date.now()) {
          throw new Error("Invalid or expired session");
        }

        const user = await ctx.db.get(session.userId);
        if (!user || !["admin", "owner", "cardsetter"].includes(user.role!)) {
            throw new Error("Unauthorized");
        }

        // Check if a card with this custom ID already exists
        const existingCard = await ctx.db
            .query("cards")
            .withIndex("by_customId", q => q.eq("customId", customId))
            .unique();

        if (existingCard) {
            throw new Error("A card with this ID already exists.");
        }

        const cardId = await ctx.db.insert("cards", {
            customId: customId,
            cardType: "Default Type", // Default value
            cardName: "New Card", // Default value
            name_normalized: "new card",
        });

        return cardId;
    }
})