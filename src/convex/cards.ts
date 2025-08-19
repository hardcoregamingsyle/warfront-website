import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: { cardId: v.string() },
  handler: async (ctx, { cardId }) => {
    const normalizedId = ctx.db.normalizeId("cards", cardId);
    if (normalizedId === null) {
      return null;
    }
    return await ctx.db.get(normalizedId);
  },
});

export const update = mutation({
  args: {
    cardId: v.string(),
    cardType: v.string(),
    cardName: v.string(),
    imageUrl: v.optional(v.string()),
    rarity: v.optional(v.string()),
    frame: v.optional(v.string()),
    batch: v.optional(v.string()),
    numberingA: v.optional(v.number()),
    numberingB: v.optional(v.number()),
    signed: v.optional(v.string()),
    token: v.string(),
  },
  handler: async (ctx, { cardId, cardType, cardName, imageUrl, rarity, frame, batch, numberingA, numberingB, signed, token }) => {
    const normalizedId = ctx.db.normalizeId("cards", cardId);
    if (normalizedId === null) {
      throw new Error("Invalid card ID.");
    }

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

    await ctx.db.patch(normalizedId, {
      cardType,
      cardName,
      imageUrl,
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
  args: { cardId: v.string(), token: v.string() },
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

    const normalizedId = ctx.db.normalizeId("cards", cardId);
    if (normalizedId === null) {
      throw new Error("Invalid card ID.");
    }

    // 1. Delete the card itself
    await ctx.db.delete(normalizedId);

    // 2. Find and delete all userCards associated with this card
    const userCardEntries = await ctx.db
      .query("userCards")
      .withIndex("by_cardId", (q) => q.eq("cardId", normalizedId))
      .collect();

    for (const entry of userCardEntries) {
      await ctx.db.delete(entry._id);
    }

    return { success: true };
  },
});

// This function is for admins to create a new blank card entry,
// which generates the unique ID they can then visit.
export const createBlankCard = mutation({
    args: { token: v.string() },
    handler: async (ctx, { token }) => {
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

        const cardId = await ctx.db.insert("cards", {
            cardType: "Ammo", // Default value
            cardName: "Missile", // Default value
        });

        return cardId;
    }
})