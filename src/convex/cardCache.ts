import { v } from "convex/values";
import { internalQuery, internalMutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

type StoredCard = Doc<"cards">;

export const getCachedCard = internalQuery({
  args: { customId: v.string() },
  handler: async (ctx, { customId }) => {
    const cached = await ctx.db
      .query("cardCache")
      .withIndex("by_customId", (q) => q.eq("customId", customId))
      .unique();

    if (!cached) return null;

    const imageUrl = cached.imageId
      ? await ctx.storage.getUrl(cached.imageId)
      : null;

    return { ...cached, imageUrl };
  },
});

export const cacheCard = internalMutation({
  args: {
    cardData: v.object({
      customId: v.string(),
      cardType: v.string(),
      cardName: v.string(),
      name_normalized: v.string(),
      imageId: v.optional(v.id("_storage")),
      rarity: v.optional(v.string()),
      rarityId: v.optional(v.id("rarities")),
      upgradeId: v.optional(v.id("upgrades")),
      frame: v.optional(v.string()),
      batch: v.optional(v.string()),
      numberingA: v.optional(v.number()),
      numberingB: v.optional(v.number()),
      signed: v.optional(v.string()),
      health: v.optional(v.number()),
      attackSlots: v.optional(v.number()),
      abilitySlots: v.optional(v.number()),
      passiveSlots: v.optional(v.number()),
      claimCode: v.optional(v.string()),
      isClaimed: v.optional(v.boolean()),
      verifyToken: v.optional(v.string()),
      verifyTokenExpiry: v.optional(v.number()),
    }),
  },
  handler: async (ctx, { cardData }) => {
    const existing = await ctx.db
      .query("cardCache")
      .withIndex("by_customId", (q) => q.eq("customId", cardData.customId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...cardData,
        loadedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("cardCache", {
        ...cardData,
        loadedAt: Date.now(),
      });
    }
  },
});

export const removeCachedCard = internalMutation({
  args: { customId: v.string() },
  handler: async (ctx, { customId }) => {
    const cached = await ctx.db
      .query("cardCache")
      .withIndex("by_customId", (q) => q.eq("customId", customId))
      .unique();

    if (cached) {
      await ctx.db.delete(cached._id);
    }
  },
});

export const getAllCardsForSync = internalQuery({
  args: {},
  handler: async (ctx): Promise<StoredCard[]> => {
    return await ctx.db.query("cards").take(1000);
  },
});

// Public query to check if a card is currently cached
export const isCached = query({
  args: { customId: v.string() },
  handler: async (ctx, { customId }) => {
    const cached = await ctx.db
      .query("cardCache")
      .withIndex("by_customId", (q) => q.eq("customId", customId))
      .unique();
    return cached !== null;
  },
});
