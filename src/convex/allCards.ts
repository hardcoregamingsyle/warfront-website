import { query } from "./_generated/server";
import { v } from "convex/values";
import { ROLES } from "./schema";

async function getOwnerNameForCard(
  ctx: any,
  cardId: any,
  fallbackOwnerName: string
) {
  const ownership = await ctx.db
    .query("userCards")
    .withIndex("by_cardId", (q: any) => q.eq("cardId", cardId))
    .take(1);

  if (ownership.length === 0) {
    return fallbackOwnerName;
  }

  const user = await ctx.db.get(ownership[0].userId);
  return user?.name ?? "Unknown User";
}

export const getAllCardsWithOwners = query({
  args: {},
  handler: async (ctx) => {
    const cards = await ctx.db.query("cards").order("desc").take(1000);
    const ownerAccount = (
      await ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", ROLES.OWNER)).take(1)
    )[0];
    const fallbackOwnerName = ownerAccount?.name ?? "Unassigned";

    const cardsWithOwners = await Promise.all(
      cards.map(async (card) => {
        const ownerName = await getOwnerNameForCard(
          ctx,
          card._id,
          fallbackOwnerName
        );

        const imageUrl = card.imageId ? await ctx.storage.getUrl(card.imageId) : null;

        return {
          ...card,
          ownerName,
          imageUrl,
        };
      })
    );

    return cardsWithOwners;
  },
});

export const getOwnerNamesForCards = query({
  args: { customIds: v.array(v.string()) },
  handler: async (ctx, { customIds }) => {
    const ownerAccount = (
      await ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", ROLES.OWNER)).take(1)
    )[0];
    const fallbackOwnerName = ownerAccount?.name ?? "Unassigned";

    const entries = await Promise.all(
      customIds.map(async (customId) => {
        const card = await ctx.db
          .query("cards")
          .withIndex("by_customId", (q) => q.eq("customId", customId))
          .unique();

        if (!card) {
          return [customId, fallbackOwnerName] as const;
        }

        const ownerName = await getOwnerNameForCard(
          ctx,
          card._id,
          fallbackOwnerName
        );

        return [customId, ownerName] as const;
      })
    );

    return Object.fromEntries(entries);
  },
});

export const getFallbackPage = query({
  args: {
    page: v.number(),
    pageSize: v.number(),
  },
  handler: async (ctx, { page, pageSize }) => {
    const safePage = Math.max(0, page);
    const safePageSize = Math.max(1, Math.min(pageSize, 50));
    const start = safePage * safePageSize;
    const limit = Math.min(start + safePageSize + 1, 1000);

    const cards = await ctx.db.query("cards").order("desc").take(limit);
    const pageCards = cards.slice(start, start + safePageSize);

    const ownerAccount = (
      await ctx.db.query("users").withIndex("by_role", (q) => q.eq("role", ROLES.OWNER)).take(1)
    )[0];
    const fallbackOwnerName = ownerAccount?.name ?? "Unassigned";

    const ownerEntries = await Promise.all(
      pageCards.map(async (card) => {
        const ownerName = await getOwnerNameForCard(
          ctx,
          card._id,
          fallbackOwnerName
        );

        return [card.customId, ownerName] as const;
      })
    );

    return {
      cards: pageCards,
      ownerByCustomId: Object.fromEntries(ownerEntries),
      hasMore: cards.length > start + safePageSize,
    };
  },
});