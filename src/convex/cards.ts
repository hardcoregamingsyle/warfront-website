import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const get = query({
  args: { cardId: v.id("cards") },
  handler: async (ctx, { cardId }) => {
    return await ctx.db.get(cardId);
  },
});

export const update = mutation({
  args: {
    cardId: v.id("cards"),
    cardType: v.string(),
    cardName: v.string(),
    imageUrl: v.optional(v.string()),
    token: v.string(),
  },
  handler: async (ctx, { cardId, cardType, cardName, imageUrl, token }) => {
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
      imageUrl,
    });
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