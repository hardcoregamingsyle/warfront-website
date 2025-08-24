"use node";

import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";

const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;

export const deleteUnverifiedUsers = internalAction({
  args: {},
  handler: async (ctx): Promise<string> => {
    const sevenDaysAgo = Date.now() - SEVEN_DAYS_IN_MS;

    // Get unverified users created more than 7 days ago
    const oldUnverifiedUsers = await ctx.runQuery(
      internal.users.getOldUnverifiedUsers,
      {
        creationTime: sevenDaysAgo,
      }
    );

    // Delete each user and their associated data
    for (const user of oldUnverifiedUsers) {
      await ctx.runMutation(internal.users.internalDeleteUser, { userId: user._id });
      console.log(`Deleted unverified user: ${user.name} (${user._id})`);
    }

    return `Deleted ${oldUnverifiedUsers.length} unverified users.`;
  },
});