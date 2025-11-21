import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

// This is a placeholder file for the blog functionality.
// It will be fully implemented in a future step.

export const list = query({
    args: {},
    handler: async (ctx) => {
        // In the future, this will list all blog posts.
        return [];
    }
});

export const getBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, { slug }) => {
        // In the future, this will get a blog post by its slug.
        return null;
    }
});

export const create = mutation({
    args: {
        title: v.string(),
        slug: v.string(),
        content: v.string(),
        token: v.string(), // To authorize
    },
    handler: async (ctx, args) => {
        // In the future, this will create a new blog post.
        // For now, we just trigger the build to simulate the effect if this were real.
        await ctx.scheduler.runAfter(0, (internal as any).seo.triggerBuild, {});
        await ctx.scheduler.runAfter(0, (internal as any).seo.notifyIndexNow, { paths: [`/blog/${args.slug}`] });
        return null;
    }
});

export const update = mutation({
    args: {
        blogId: v.id("blogs"),
        title: v.optional(v.string()),
        slug: v.optional(v.string()),
        content: v.optional(v.string()),
        token: v.string(), // To authorize
    },
    handler: async (ctx, args) => {
        // In the future, this will update a blog post.
        await ctx.scheduler.runAfter(0, (internal as any).seo.triggerBuild, {});
        // We don't have the slug here easily without querying, but this is a placeholder.
        // If we had the slug, we would notify.
    }
});