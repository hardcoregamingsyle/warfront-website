import { mutation } from "./_generated/server";
import { ROLES } from "./schema";

// Simple hash function for demo purposes - not secure for production
const FAKE_HASH_SALT = "this-is-not-secure-and-should-be-in-an-env-var";
const hashPassword = (password: string) => {
  // Simple string hash for demo - use proper bcrypt in production
  let hash = 0;
  const str = password + FAKE_HASH_SALT;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
};

export const createSeedUsers = mutation({
  handler: async (ctx) => {
    const usersToCreate = [
      {
        name: "Warfront_Owner",
        email: "hardcorgamingstyle@gmail.com",
        password: "Belive*8",
        role: ROLES.OWNER,
      },
      {
        name: "Warfront_Admin",
        email: "hardcorgamingstyle@gmail.com",
        password: "Belive*8",
        role: ROLES.ADMIN,
      },
      {
        name: "cardsetter1",
        email: "hardcorgamingstyle@gmail.com",
        password: "Belive*8",
        role: ROLES.CARDSETTER,
      },
      {
        name: "Cardsetter2",
        email: "hardcorgamingstyle@gmail.com",
        password: "Belive*8",
        role: ROLES.CARDSETTER,
      },
      {
        name: "Testaccount123",
        email: "hardcorgamingstyle@gmail.com",
        password: "Belive*8",
        role: ROLES.TEST,
      },
    ];

    for (const userData of usersToCreate) {
      const lowerName = userData.name.toLowerCase();
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_name_normalized", (q) => q.eq("name_normalized", lowerName))
        .first();

      if (!existingUser) {
        await ctx.db.insert("users", {
          name: userData.name,
          email: userData.email,
          passwordHash: hashPassword(userData.password),
          role: userData.role,
          name_normalized: lowerName,
          email_normalized: userData.email.toLowerCase(),
        });
      }
    }
    return "Seed users created successfully (if they didn't already exist).";
  },
});