"use node";

import { v } from "convex/values";
import { internalAction, action } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const sendFriendRequestEmail = internalAction({
  args: { friendshipId: v.id("friendships") },
  handler: async (ctx, { friendshipId }) => {
    const friendship = await ctx.runQuery(api.friends.getFriendshipDetails, { friendshipId });
    
    if (!friendship) return;

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
      await resend.emails.send({
        from: "Warfront <noreply@warfront.com>",
        to: [friendship.requestee.email],
        subject: `${friendship.requester.displayName || friendship.requester.name} sent you a friend request on Warfront`,
        html: `
          <h2>New Friend Request</h2>
          <p>${friendship.requester.displayName || friendship.requester.name} (@${friendship.requester.name}) has sent you a friend request on Warfront!</p>
          <p>Log in to your account to accept or decline this request.</p>
          <p>Happy gaming!</p>
          <p>- The Warfront Team</p>
        `,
      });
    } catch (error) {
      console.error("Failed to send friend request email:", error);
    }
  },
});

export const sendFriendResponseEmail = action({
  args: { 
    friendshipId: v.id("friendships"),
    response: v.union(v.literal("accepted"), v.literal("declined"))
  },
  handler: async (ctx, { friendshipId, response }) => {
    const friendship = await ctx.runQuery(api.friends.getFriendshipDetails, { friendshipId });
    
    if (!friendship) return;

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const subject = response === "accepted" 
      ? `${friendship.requestee.displayName || friendship.requestee.name} accepted your friend request!`
      : `${friendship.requestee.displayName || friendship.requestee.name} declined your friend request`;

    const message = response === "accepted"
      ? `Great news! ${friendship.requestee.displayName || friendship.requestee.name} (@${friendship.requestee.name}) has accepted your friend request on Warfront. You can now challenge them to battles!`
      : `${friendship.requestee.displayName || friendship.requestee.name} (@${friendship.requestee.name}) has declined your friend request on Warfront.`;

    try {
      await resend.emails.send({
        from: "Warfront <noreply@warfront.com>",
        to: [friendship.requester.email],
        subject,
        html: `
          <h2>Friend Request ${response === "accepted" ? "Accepted" : "Declined"}</h2>
          <p>${message}</p>
          <p>Happy gaming!</p>
          <p>- The Warfront Team</p>
        `,
      });
    } catch (error) {
      console.error("Failed to send friend response email:", error);
    }
  },
});