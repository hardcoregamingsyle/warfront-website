import { v } from "convex/values";
import { mutation, query, action, internalQuery } from "./_generated/server";
import { internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const sendFriendRequest = mutation({
  args: { 
    token: v.string(),
    requesteeId: v.id("users") 
  },
  handler: async (ctx, { token, requesteeId }) => {
    // Get current user from token
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (!session || session.expires < Date.now()) {
      throw new Error("Invalid or expired session");
    }

    const requester = await ctx.db.get(session.userId);
    if (!requester) {
      throw new Error("User not found");
    }

    // Can't friend yourself
    if (session.userId === requesteeId) {
      throw new Error("You cannot send a friend request to yourself");
    }

    // Check if friendship already exists
    const existingFriendship = await ctx.db
      .query("friendships")
      .withIndex("by_requestee_and_requester", (q) => 
        q.eq("requesteeId", requesteeId).eq("requesterId", session.userId)
      )
      .first();

    if (existingFriendship) {
      throw new Error("Friend request already exists");
    }

    // Check reverse friendship
    const reverseFriendship = await ctx.db
      .query("friendships")
      .withIndex("by_requestee_and_requester", (q) => 
        q.eq("requesteeId", session.userId).eq("requesterId", requesteeId)
      )
      .first();

    if (reverseFriendship) {
      throw new Error("This user has already sent you a friend request");
    }

    // Create friend request
    const friendshipId = await ctx.db.insert("friendships", {
      requesterId: session.userId,
      requesteeId,
      status: "pending"
    });

    // Schedule email notification
    await ctx.scheduler.runAfter(0, internal.friendsActions.sendFriendRequestEmail, {
      friendshipId,
    });

    return friendshipId;
  },
});

export const respondToFriendRequest = mutation({
  args: { 
    token: v.string(),
    friendshipId: v.id("friendships"),
    response: v.union(v.literal("accepted"), v.literal("declined"))
  },
  handler: async (ctx, { token, friendshipId, response }) => {
    // Get current user from token
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (!session || session.expires < Date.now()) {
      throw new Error("Invalid or expired session");
    }

    const friendship = await ctx.db.get(friendshipId);
    if (!friendship) {
      throw new Error("Friend request not found");
    }

    // Only the requestee can respond
    if (friendship.requesteeId !== session.userId) {
      throw new Error("You can only respond to friend requests sent to you");
    }

    if (friendship.status !== "pending") {
      throw new Error("This friend request has already been responded to");
    }

    // Update friendship status
    await ctx.db.patch(friendshipId, { status: response });

    // Schedule email notification to requester
    await ctx.scheduler.runAfter(0, api.friendsActions.sendFriendResponseEmail, {
      friendshipId,
      response,
    });

    return response;
  },
});

export const getFriendRequests = query({
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

    const requests = await ctx.db
      .query("friendships")
      .withIndex("by_requesteeId_status", (q) => 
        q.eq("requesteeId", session.userId).eq("status", "pending")
      )
      .collect();

    const requestsWithUsers = await Promise.all(
      requests.map(async (request) => {
        const requester = await ctx.db.get(request.requesterId);
        return {
          ...request,
          requester: requester ? {
            _id: requester._id,
            name: requester.name,
            displayName: requester.displayName,
            image: requester.image,
          } : null,
        };
      })
    );

    return requestsWithUsers.filter(req => req.requester !== null);
  },
});

export const getFriends = query({
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

    // Get friendships where current user is requester
    const friendshipsAsRequester = await ctx.db
      .query("friendships")
      .withIndex("by_requesterId_status", (q) => 
        q.eq("requesterId", session.userId).eq("status", "accepted")
      )
      .collect();

    // Get friendships where current user is requestee
    const friendshipsAsRequestee = await ctx.db
      .query("friendships")
      .withIndex("by_requesteeId_status", (q) => 
        q.eq("requesteeId", session.userId).eq("status", "accepted")
      )
      .collect();

    const allFriendships = [...friendshipsAsRequester, ...friendshipsAsRequestee];

    const friends = await Promise.all(
      allFriendships.map(async (friendship) => {
        const friendId = friendship.requesterId === session.userId 
          ? friendship.requesteeId 
          : friendship.requesterId;
        
        const friend = await ctx.db.get(friendId);
        return friend ? {
          _id: friend._id,
          name: friend.name,
          displayName: friend.displayName,
          image: friend.image,
        } : null;
      })
    );

    return friends.filter(friend => friend !== null);
  },
});

export const checkFriendshipStatus = query({
  args: { 
    token: v.optional(v.string()),
    userId: v.id("users")
  },
  handler: async (ctx, { token, userId }) => {
    if (!token) return null;

    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .unique();

    if (!session || session.expires < Date.now()) {
      return null;
    }

    if (session.userId === userId) {
      return "self";
    }

    // Check if friendship exists (either direction)
    const friendship1 = await ctx.db
      .query("friendships")
      .withIndex("by_requestee_and_requester", (q) => 
        q.eq("requesteeId", userId).eq("requesterId", session.userId)
      )
      .first();

    const friendship2 = await ctx.db
      .query("friendships")
      .withIndex("by_requestee_and_requester", (q) => 
        q.eq("requesteeId", session.userId).eq("requesterId", userId)
      )
      .first();

    const friendship = friendship1 || friendship2;

    if (!friendship) {
      return "none";
    }

    if (friendship.status === "accepted") {
      return "friends";
    }

    if (friendship.status === "pending") {
      if (friendship.requesterId === session.userId) {
        return "pending_sent";
      } else {
        return "pending_received";
      }
    }

    return "declined";
  },
});

export const getFriendshipDetails = query({
  args: { friendshipId: v.id("friendships") },
  handler: async (ctx, { friendshipId }) => {
    const friendship = await ctx.db.get(friendshipId);
    if (!friendship) return null;

    const requester = await ctx.db.get(friendship.requesterId);
    const requestee = await ctx.db.get(friendship.requesteeId);

    if (!requester || !requestee) return null;

    return {
      requester: {
        _id: requester._id,
        name: requester.name,
        displayName: requester.displayName,
        email: requester.email,
      },
      requestee: {
        _id: requestee._id,
        name: requestee.name,
        displayName: requestee.displayName,
        email: requestee.email,
      },
    };
  },
});

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