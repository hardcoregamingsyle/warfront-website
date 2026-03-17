import { v } from "convex/values";
import { internalQuery, internalMutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

type StoredCard = Doc<"cards">;
type CachedCard = Doc<"cardCache">;

function toHydratedCard(cached: CachedCard, imageUrl: string | null) {
  return {
    ...cached,
    _id: (cached.sourceCardId ?? (cached._id as unknown)) as StoredCard["_id"],
    imageUrl,
  };
}

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

    return toHydratedCard(cached, imageUrl);
  },
});

export const getCachedCardsByCustomIds = internalQuery({
  args: { customIds: v.array(v.string()) },
  handler: async (ctx, { customIds }) => {
    const cards = await Promise.all(
      customIds.map(async (customId) => {
        const cached = await ctx.db
          .query("cardCache")
          .withIndex("by_customId", (q) => q.eq("customId", customId))
          .unique();

        if (!cached) return null;

        const imageUrl = cached.imageId
          ? await ctx.storage.getUrl(cached.imageId)
          : null;

        return toHydratedCard(cached, imageUrl);
      })
    );

    return cards.filter(
      (card): card is NonNullable<typeof card> => card !== null
    );
  },
});

export const cacheCard = internalMutation({
  args: {
    cardData: v.object({
      customId: v.string(),
      sourceCardId: v.optional(v.id("cards")),
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
        activeViewers: (existing.activeViewers ?? 0) + 1,
        loadedAt: Date.now(),
      });
      return;
    }

    await ctx.db.insert("cardCache", {
      ...cardData,
      activeViewers: 1,
      loadedAt: Date.now(),
    });
  },
});

export const removeCachedCard = internalMutation({
  args: { customId: v.string() },
  handler: async (ctx, { customId }) => {
    const cached = await ctx.db
      .query("cardCache")
      .withIndex("by_customId", (q) => q.eq("customId", customId))
      .unique();

    if (!cached) return;

    const nextViewers = (cached.activeViewers ?? 1) - 1;
    if (nextViewers > 0) {
      await ctx.db.patch(cached._id, {
        activeViewers: nextViewers,
        loadedAt: Date.now(),
      });
      return;
    }

    await ctx.db.delete(cached._id);
  },
});

export const getAllCardsForSync = internalQuery({
  args: {},
  handler: async (ctx): Promise<StoredCard[]> => {
    return await ctx.db.query("cards").order("desc").take(1000);
  },
});

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