import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { validatePrivilegedUser } from "./helpers/auth";

export const get = query({
  args: { customId: v.string() },
  handler: async (ctx, { customId }) => {
    const card = await ctx.db
      .query("cards")
      .withIndex("by_customId", (q) => q.eq("customId", customId))
      .unique();

    if (!card) return null;

    const imageUrl = card.imageId
      ? await ctx.storage.getUrl(card.imageId)
      : null;

    return {
      ...card,
      imageUrl,
    };
  },
});

export const update = mutation({
  args: {
    cardId: v.id("cards"),
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
  handler: async (
    ctx,
    {
      cardId,
      cardType,
      cardName,
      imageId,
      rarity,
      frame,
      batch,
      numberingA,
      numberingB,
      signed,
      token,
    }
  ) => {
    await validatePrivilegedUser(ctx, token);

    await ctx.db.patch(cardId, {
      cardType,
      cardName,
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
    await validatePrivilegedUser(ctx, token);

    const card = await ctx.db.get(cardId);
    if (!card) {
      throw new Error("Card not found");
    }

    if (card.imageId) {
      await ctx.storage.delete(card.imageId);
    }

    await ctx.db.delete(cardId);

    const userCardEntries = await ctx.db
      .query("userCards")
      .withIndex("by_cardId", (q) => q.eq("cardId", cardId))
      .collect();

    await Promise.all(
      userCardEntries.map((entry) => ctx.db.delete(entry._id))
    );

    return { success: true };
  },
});

export const deleteAllCards = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const { user } = await validatePrivilegedUser(ctx, token);

    const roleNorm = (user.role ?? "")
      .toString()
      .toLowerCase()
      .replace(/[\s_-]+/g, "");
    const emailNorm = (user.email ?? "").toString().toLowerCase();
    const isAdminOwner =
      ["admin", "owner"].includes(roleNorm) ||
      emailNorm === "hardcorgamingstyle@gmail.com";

    if (!isAdminOwner) {
      throw new Error("Unauthorized");
    }

    const allCards = await ctx.db.query("cards").collect();
    let deletedCount = 0;

    for (const card of allCards) {
      if (card.imageId) {
        await ctx.storage.delete(card.imageId);
      }

      await ctx.db.delete(card._id);

      const userCardEntries = await ctx.db
        .query("userCards")
        .withIndex("by_cardId", (q) => q.eq("cardId", card._id))
        .collect();

      await Promise.all(
        userCardEntries.map((entry) => ctx.db.delete(entry._id))
      );
      deletedCount++;
    }

    return { success: true, deletedCount };
  },
});

export const createCardWithId = mutation({
  args: { token: v.string(), customId: v.string() },
  handler: async (ctx, { token, customId }) => {
    await validatePrivilegedUser(ctx, token);

    const existingCard = await ctx.db
      .query("cards")
      .withIndex("by_customId", (q) => q.eq("customId", customId))
      .unique();

    if (existingCard) {
      throw new Error("A card with this ID already exists.");
    }

    return await ctx.db.insert("cards", {
      customId: customId,
      cardType: "Default Type",
      cardName: "New Card",
      name_normalized: "new card",
    });
  },
});