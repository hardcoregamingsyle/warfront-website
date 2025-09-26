import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { roleValidator } from "./schema";

export const getUnread = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, { token }) => {
    if (!token) return [];

    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (!session || session.expires < Date.now()) {
      return [];
    }

    return await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", session.userId))
      .filter((q) => q.eq(q.field("read"), false))
      .order("desc")
      .collect();
  },
});

export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, { notificationId }) => {
    await ctx.db.patch(notificationId, { read: true });
  },
});

export const markAllAsRead = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (!session || session.expires < Date.now()) {
      throw new Error("Invalid or expired session");
    }

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", session.userId))
      .filter((q) => q.eq(q.field("read"), false))
      .collect();

    await Promise.all(
      unreadNotifications.map((notification) =>
        ctx.db.patch(notification._id, { read: true })
      )
    );
  },
});

// Helper: assert admin privileges by token (duplicated locally to avoid cross-file deps)
const assertIsAdminByToken = async (ctx: any, token: string) => {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q: any) => q.eq("token", token))
    .unique();

  if (!session || session.expires < Date.now()) {
    throw new Error("Invalid or expired session");
  }

  const current = await ctx.db.get(session.userId);
  if (!current) throw new Error("User not found");

  const roleLc = (current.role ?? "").toString().toLowerCase();
  const emailLc = (current.email_normalized ?? "").toLowerCase();
  const isAdmin =
    roleLc === "admin" || roleLc === "owner" || emailLc === "hardcorgamingstyle@gmail.com";

  if (!isAdmin) throw new Error("Not authorized");
  return { current, session };
};

// New mutation: broadcast notifications to users with selected roles
export const adminBroadcastNotification = mutation({
  args: {
    token: v.string(),
    roles: v.array(roleValidator),
    title: v.string(),
    message: v.string(),
  },
  handler: async (ctx, { token, roles, title, message }) => {
    await assertIsAdminByToken(ctx, token);

    if (roles.length === 0) {
      throw new Error("Select at least one role");
    }

    // Gather users for each role (dedupe)
    const userMap = new Map<string, Id<"users">>();
    const usersForEmail: Array<{ _id: Id<"users">; email: string; name: string }> = [];

    for (const role of roles) {
      const users = await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", role))
        .collect();

      for (const u of users) {
        const key = u._id;
        if (!userMap.has(key as unknown as string)) {
          userMap.set(key as unknown as string, u._id);
          if (u.email) {
            usersForEmail.push({ _id: u._id, email: u.email, name: u.name ?? "Player" });
          }
        }
      }
    }

    // Add: formatted message with bold title (markdown-like)
    const formattedMessage = `**${title}** — ${message}`;

    // Insert notifications with bold title prefix in message
    for (const [, userId] of userMap) {
      await ctx.db.insert("notifications", {
        userId,
        type: "broadcast",
        message: formattedMessage, // Title shown in bold-style prefix
        href: "/dashboard",
        read: false,
      });
    }

    // Send emails with HTML bold title and text fallback
    for (const u of usersForEmail) {
      await ctx.scheduler.runAfter(0, internal.auth_actions.sendNotificationEmail, {
        email: u.email,
        name: u.name,
        subject: title,
        html: `<strong>${title}</strong><br/>${message}`,
        text: `${title} — ${message}`,
      });
    }

    return `Sent to ${userMap.size} users.`;
  },
});