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
        role: ROLES.CARD_SETTER,
      },
      {
        name: "Cardsetter2",
        email: "hardcorgamingstyle@gmail.com",
        password: "Belive*8",
        role: ROLES.CARD_SETTER,
      },
      {
        name: "Testaccount123",
        email: "hardcorgamingstyle@gmail.com",
        password: "Belive*8",
        role: ROLES.VERIFIED,
      },
    ];

    // To fix any potential password hash issues, we will delete and recreate the seed users.
    for (const userData of usersToCreate) {
      const lowerName = userData.name.toLowerCase();
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_name_normalized", (q) => q.eq("name_normalized", lowerName))
        .first();

      if (existingUser) {
        // Also delete associated sessions
        const sessions = await ctx.db
            .query("sessions")
            .withIndex("by_userId", (q) => q.eq("userId", existingUser._id))
            .collect();
        for (const session of sessions) {
            await ctx.db.delete(session._id);
        }
        await ctx.db.delete(existingUser._id);
      }

      // Create the user with a fresh password hash.
      await ctx.db.insert("users", {
        name: userData.name,
        email: userData.email,
        passwordHash: hashPassword(userData.password),
        role: userData.role,
        name_normalized: lowerName,
        email_normalized: userData.email.toLowerCase(),
      });
    }
    return "Seed users have been reset successfully.";
  },
});

export const createSeedCards = mutation({
  handler: async (ctx) => {
    const testCards = [
      {
        customId: "mig-29",
        cardName: "MiG-29 Fulcrum",
        cardType: "Fighter Jet",
        rarity: "Rare",
        frame: "Gold",
        batch: "A",
        numberingA: 1,
        numberingB: 100,
        signed: "No",
        health: 85,
        attackSlots: 3,
        abilitySlots: 2,
        passiveSlots: 1,
        claimCode: "MIG29-ALPHA-001",
        isClaimed: false,
      },
      {
        customId: "f-22-raptor",
        cardName: "F-22 Raptor",
        cardType: "Stealth Fighter",
        rarity: "Ultra Rare",
        frame: "Holographic",
        batch: "A",
        numberingA: 1,
        numberingB: 50,
        signed: "No",
        health: 95,
        attackSlots: 4,
        abilitySlots: 3,
        passiveSlots: 2,
        claimCode: "F22-RAPTOR-001",
        isClaimed: false,
      },
      {
        customId: "su-57",
        cardName: "Su-57 Felon",
        cardType: "Stealth Fighter",
        rarity: "Super Rare",
        frame: "Silver",
        batch: "B",
        numberingA: 5,
        numberingB: 75,
        signed: "No",
        health: 90,
        attackSlots: 3,
        abilitySlots: 2,
        passiveSlots: 2,
        claimCode: "SU57-FELON-005",
        isClaimed: false,
      },
      {
        customId: "a-10-warthog",
        cardName: "A-10 Thunderbolt II",
        cardType: "Ground Attack",
        rarity: "Common",
        frame: "Standard",
        batch: "A",
        numberingA: 12,
        numberingB: 200,
        signed: "No",
        health: 70,
        attackSlots: 2,
        abilitySlots: 1,
        passiveSlots: 1,
        claimCode: "A10-WARTHOG-012",
        isClaimed: false,
      },
      {
        customId: "b-2-spirit",
        cardName: "B-2 Spirit",
        cardType: "Strategic Bomber",
        rarity: "Legendary",
        frame: "Black Diamond",
        batch: "A",
        numberingA: 1,
        numberingB: 10,
        signed: "Yes",
        health: 100,
        attackSlots: 5,
        abilitySlots: 4,
        passiveSlots: 3,
        claimCode: "B2-SPIRIT-001",
        isClaimed: false,
      },
      {
        customId: "eurofighter",
        cardName: "Eurofighter Typhoon",
        cardType: "Multirole Fighter",
        rarity: "Uncommon",
        frame: "Bronze",
        batch: "C",
        numberingA: 8,
        numberingB: 150,
        signed: "No",
        health: 80,
        attackSlots: 3,
        abilitySlots: 2,
        passiveSlots: 1,
        claimCode: "EURO-TYPHOON-008",
        isClaimed: false,
      },
    ];

    let created = 0;
    let skipped = 0;

    for (const cardData of testCards) {
      const existing = await ctx.db
        .query("cards")
        .withIndex("by_customId", (q) => q.eq("customId", cardData.customId))
        .unique();

      if (existing) {
        skipped++;
        continue;
      }

      await ctx.db.insert("cards", {
        ...cardData,
        name_normalized: cardData.cardName.toLowerCase(),
      });
      created++;
    }

    return { created, skipped, total: testCards.length };
  },
});