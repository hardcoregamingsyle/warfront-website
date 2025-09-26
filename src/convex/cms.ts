import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const CategoryValidator = v.union(
  v.literal("unsorted"),
  v.literal("public"),
  v.literal("private"),
  v.literal("cards"),
  v.literal("robot"),
);

export const getByCategory = query({
  args: { category: CategoryValidator },
  handler: async (ctx, { category }) => {
    const pages = await ctx.db
      .query("cms_pages")
      .withIndex("by_category", (q) => q.eq("category", category))
      .collect();
    return pages;
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const pages = await ctx.db.query("cms_pages").collect();
    return pages;
  },
});

export const ensure = mutation({
  args: {
    path: v.string(),
    title: v.optional(v.string()),
  },
  handler: async (ctx, { path, title }) => {
    const existing = await ctx.db
      .query("cms_pages")
      .withIndex("by_path", (q) => q.eq("path", path))
      .unique();
    if (existing) {
      // Update title if provided and changed
      if (title && title !== existing.title) {
        await ctx.db.patch(existing._id, { title });
      }
      return existing._id;
    }
    // Derive a title if not provided
    const derivedTitle = title ?? deriveTitleFromPath(path);
    const id = await ctx.db.insert("cms_pages", {
      path,
      title: derivedTitle,
      category: "unsorted",
    });
    return id;
  },
});

export const move = mutation({
  args: {
    path: v.string(),
    to: CategoryValidator,
  },
  handler: async (ctx, { path, to }) => {
    const existing = await ctx.db
      .query("cms_pages")
      .withIndex("by_path", (q) => q.eq("path", path))
      .unique();
    if (!existing) {
      throw new Error(`Page not found for path: ${path}`);
    }
    await ctx.db.patch(existing._id, { category: to });
    return null;
  },
});

export const setTitle = mutation({
  args: {
    path: v.string(),
    title: v.string(),
  },
  handler: async (ctx, { path, title }) => {
    const existing = await ctx.db
      .query("cms_pages")
      .withIndex("by_path", (q) => q.eq("path", path))
      .unique();
    if (!existing) {
      throw new Error(`Page not found for path: ${path}`);
    }
    await ctx.db.patch(existing._id, { title });
    return null;
  },
});

function deriveTitleFromPath(path: string): string {
  const segs = path.split("/").filter(Boolean);
  const last = segs[segs.length - 1] ?? "/";
  if (!last) return path;
  const words = last.replace(/[-_]+/g, " ").trim();
  if (!words) return path;
  return words
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
