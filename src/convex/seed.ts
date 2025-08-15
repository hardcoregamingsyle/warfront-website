import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import * as bcrypt from "bcryptjs";

const usersToCreate = [
  {
    username: "warfront_admin",
    email: "warfront_admin@example.com",
    role: "admin",
  },
  { username: "admin", email: "admin@example.com", role: "admin" },
  {
    username: "CardSetter1",
    email: "cardsetter1@example.com",
    role: "user",
  },
  {
    username: "CardSetter2",
    email: "cardsetter2@example.com",
    role: "user",
  },
  {
    username: "Warfront_Admin2",
    email: "warfront_admin2@example.com",
    role: "admin",
  },
];

export const users = action({
  handler: async (ctx) => {
    const defaultPassword = "password123"; // NOTE: Use a more secure password in production
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    for (const user of usersToCreate) {
      const existingUser = await ctx.runQuery(
        internal.users._getUserByIdentifier,
        { identifier: user.email },
      );
      if (existingUser) {
        console.log(`User ${user.username} already exists, skipping.`);
        continue;
      }

      await ctx.runMutation(internal.users._createUserAndSession, {
        userData: {
          username: user.username,
          email: user.email,
          password: hashedPassword,
          role: user.role,
        },
      });
      console.log(`Created user: ${user.username}`);
    }
    return `Seeded ${usersToCreate.length} users.`;
  },
});

export const updateUserCredentials = action({
  handler: async (ctx) => {
    const newPassword = "Belive*8";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const usernamesToUpdate = [
      "warfront_admin",
      "admin",
      "CardSetter1",
      "CardSetter2",
      "Warfront_Admin2",
    ];

    let updatedCount = 0;

    for (const username of usernamesToUpdate) {
      const user = await ctx.runQuery(internal.users._getUserByIdentifier, {
        identifier: username,
      });

      if (user) {
        await ctx.runMutation(internal.users._updateUserPassword, {
          userId: user._id,
          hashedPassword: hashedPassword,
        });
        console.log(`Updated password for user: ${username}`);
        updatedCount++;
      } else {
        console.log(`User ${username} not found, skipping.`);
      }
    }
    return `Updated credentials for ${updatedCount} users.`;
  },
});

export const migrateUsernamesToLowercase = action({
  handler: async (ctx) => {
    const usernamesToUpdate = [
      "warfront_admin",
      "admin",
      "CardSetter1",
      "CardSetter2",
      "Warfront_Admin2",
    ];

    let updatedCount = 0;

    for (const username of usernamesToUpdate) {
      const user = await ctx.runQuery(internal.users._getUserByIdentifier, {
        identifier: username,
      });

      if (user) {
        const lowercaseUsername = user.username.toLowerCase();
        if (user.username !== lowercaseUsername) {
          await ctx.runMutation(internal.users._updateUsername, {
            userId: user._id,
            username: lowercaseUsername,
          });
          console.log(
            `Updated username for user: ${username} to ${lowercaseUsername}`,
          );
          updatedCount++;
        }
      } else {
        console.log(`User ${username} not found, skipping.`);
      }
    }
    return `Updated usernames for ${updatedCount} users.`;
  },
});