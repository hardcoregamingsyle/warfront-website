import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";

async function triggerSEOUpdate(ctx: any, paths: string[]) {
  await ctx.scheduler.runAfter(0, internal.seo.triggerBuild, {});
  await ctx.scheduler.runAfter(0, internal.seo.notifyIndexNow, { paths });
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    return [];
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return null;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    await triggerSEOUpdate(ctx, [`/blog/${args.slug}`]);
    return null;
  },
});

export const update = mutation({
  args: {
    blogId: v.id("blogs"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    content: v.optional(v.string()),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const blog = await ctx.db.get(args.blogId);
    if (blog) {
      const slug = args.slug ?? blog.slug;
      await triggerSEOUpdate(ctx, [`/blog/${slug}`]);
    }
  },
});