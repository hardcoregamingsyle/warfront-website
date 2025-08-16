"use node";

import { internal } from "./_generated/api";
import { action } from "./_generated/server";
import { v } from "convex/values";

export const checkAndCreateUser = action({
    args: { email: v.string() },
    handler: async (ctx, { email }) => {
        if (email.toLowerCase() === "hardcorgamingstyle@gmail.com") {
            // For the special email, we don't check for existence, allowing multiple accounts.
            // The auth library will handle the creation of a new user.
            return { shouldCreate: true };
        }

        // For all other emails, check if the email is already in use.
        const emailExists = await ctx.runQuery(internal.users.emailExists, { email });

        if (emailExists) {
            // If the email exists, we don't create a new user. The auth library will sign them in.
            return { shouldCreate: false };
        }

        // If the email doesn't exist, we allow creation.
        return { shouldCreate: true };
    },
});