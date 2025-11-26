import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const get = query({
  args: { packId: v.string() },
  handler: async (ctx, { packId }) => {
    return await ctx.db
      .query("packs")
      .withIndex("by_packId", (q) => q.eq("packId", packId))
      .unique();
  },
});

export const scan = mutation({
  args: { packId: v.string() },
  handler: async (ctx, { packId }) => {
    const pack = await ctx.db
      .query("packs")
      .withIndex("by_packId", (q) => q.eq("packId", packId))
      .unique();

    if (!pack) {
      return null; // Pack not found
    }

    const newCount = (pack.scanCount || 0) + 1;
    await ctx.db.patch(pack._id, {
      scanCount: newCount,
    });

    return {
        ...pack,
        scanCount: newCount
    };
  },
});

// Helper to create a pack (useful for admin/testing)
export const create = mutation({
    args: { packId: v.string(), batch: v.optional(v.string()) },
    handler: async (ctx, { packId, batch }) => {
        const existing = await ctx.db
            .query("packs")
            .withIndex("by_packId", (q) => q.eq("packId", packId))
            .unique();
        
        if (existing) return existing._id;

        return await ctx.db.insert("packs", {
            packId,
            scanCount: 0,
            batch,
        });
    }
});
