import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  UNVERIFIED: "Unverified",
  VERIFIED: "Verified", 
  INFLUENCER: "Influencer",
  ADMIN: "Admin",
  OWNER: "Owner",
  CARD_SETTER: "Card Setter",
  BLOGGERS: "Bloggers",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.UNVERIFIED),
  v.literal(ROLES.VERIFIED),
  v.literal(ROLES.INFLUENCER),
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.OWNER),
  v.literal(ROLES.CARD_SETTER),
  v.literal(ROLES.BLOGGERS)
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    users: defineTable({
      name: v.string(),
      email: v.string(),
      passwordHash: v.string(), // For custom auth
      image: v.optional(v.string()),
      role: v.optional(roleValidator),
      // New fields for case-insensitivity
      name_normalized: v.string(),
      email_normalized: v.string(),
      // Account settings fields
      displayName: v.optional(v.string()),
      region: v.optional(v.string()),
      dob: v.optional(v.string()), // Date of Birth
      emailVerified: v.optional(v.boolean()),
      lastActivityTime: v.optional(v.number()),
    })
      .index("by_email_normalized", ["email_normalized"])
      .index("by_name_normalized", ["name_normalized"])
      .index("by_role", ["role"])
      .searchIndex("by_name", {
        searchField: "name",
      }),

    sessions: defineTable({
      userId: v.id("users"),
      token: v.string(),
      expires: v.number(), // Expiration timestamp
    })
      .index("by_token", ["token"])
      .index("by_userId", ["userId"]),

    verificationTokens: defineTable({
      userId: v.id("users"),
      token: v.string(),
      expires: v.number(),
    }).index("by_token", ["token"]).index("by_userId", ["userId"]),

    passwordResetTokens: defineTable({
      userId: v.id("users"),
      token: v.string(),
      expires: v.number(),
    }).index("by_token", ["token"]).index("by_userId", ["userId"]),

    battles: defineTable({
      hostId: v.id("users"),
      opponentId: v.optional(v.id("users")),
      status: v.union(
        v.literal("Open"),
        v.literal("Full"),
        v.literal("InProgress"),
        v.literal("Complete"),
      ),
      winnerId: v.optional(v.id("users")),
      lastActivity: v.optional(v.number()),
    })
      .index("by_hostId", ["hostId"])
      .index("by_status", ["status"]),

    multiplayerBattles: defineTable({
      hostId: v.id("users"),
      playerIds: v.array(v.id("users")),
      maxPlayers: v.number(),
      status: v.union(
        v.literal("Waiting"),
        v.literal("In Progress"),
        v.literal("Finished")
      ),
      lastActivity: v.optional(v.number()),
    })
      .index("by_status", ["status"])
      .index("by_playerIds", ["playerIds"])
      .index("by_status_and_lastActivity", ["status", "lastActivity"]),

    friendships: defineTable({
      requesterId: v.id("users"),
      requesteeId: v.id("users"),
      status: v.union(
        v.literal("pending"),
        v.literal("accepted"),
        v.literal("declined")
      ),
    })
      .index("by_requesteeId_status", ["requesteeId", "status"])
      .index("by_requesterId_status", ["requesterId", "status"])
      .index("by_requestee_and_requester", ["requesteeId", "requesterId"]),

    notifications: defineTable({
      userId: v.id("users"),
      type: v.string(),
      message: v.string(),
      href: v.string(),
      read: v.boolean(),
    })
      .index("by_userId", ["userId"]),

    cards: defineTable({
      customId: v.string(), // The user-provided ID
      cardType: v.string(),
      cardName: v.string(),
      name_normalized: v.string(), // For case-insensitive searches
      imageId: v.optional(v.id("_storage")),
      rarity: v.optional(v.string()),
      rarityId: v.optional(v.id("rarities")),
      upgradeId: v.optional(v.id("upgrades")),
      frame: v.optional(v.string()),
      batch: v.optional(v.string()),
      numberingA: v.optional(v.number()),
      numberingB: v.optional(v.number()),
      signed: v.optional(v.string()),
      // Card stats for future attacks/abilities system
      health: v.optional(v.number()),
      attackSlots: v.optional(v.number()),
      abilitySlots: v.optional(v.number()),
      passiveSlots: v.optional(v.number()),
    })
      .index("by_customId", ["customId"])
      .index("by_name_normalized", ["name_normalized"])
      .index("by_rarityId", ["rarityId"])
      .index("by_upgradeId", ["upgradeId"]),

    // New tables for the card management system
    rarities: defineTable({
      name: v.string(),
      name_normalized: v.string(),
      code: v.string(), // Short code like "C", "UC", "R", "SR", "UR"
      description: v.optional(v.string()),
    }).index("by_name_normalized", ["name_normalized"]),

    upgrades: defineTable({
      name: v.string(),
      name_normalized: v.string(),
      description: v.optional(v.string()),
    }).index("by_name_normalized", ["name_normalized"]),

    batches: defineTable({
      cardId: v.id("cards"),
      label: v.string(), // A, B, C, etc.
      type: v.union(
        v.literal("NORMAL"),
        v.literal("EXCLUSIVE"), 
        v.literal("LIMITED")
      ),
      maxSupply: v.optional(v.number()), // null for E/L batches
      minted: v.number(), // current count
      isComplete: v.boolean(),
    })
      .index("by_cardId", ["cardId"])
      .index("by_cardId_and_label", ["cardId", "label"]),

    // Future tables for attacks/abilities system (scaffolding)
    attacks: defineTable({
      name: v.string(),
      name_normalized: v.string(),
      subject: v.optional(v.string()),
      description: v.string(),
      attackType: v.string(),
      damage: v.optional(v.number()),
      heal: v.optional(v.number()),
      value: v.optional(v.number()),
    }).index("by_name_normalized", ["name_normalized"]),

    passives: defineTable({
      name: v.string(),
      name_normalized: v.string(),
      type: v.union(
        v.literal("DAMAGE_BOOST"),
        v.literal("HEALTH_BOOST"),
        v.literal("DEFENCE"),
        v.literal("AUTO_HEAL_SELF"),
        v.literal("AUTO_HEAL_ALLY")
      ),
      description: v.string(),
    }).index("by_name_normalized", ["name_normalized"]),

    abilities: defineTable({
      name: v.string(),
      name_normalized: v.string(),
      type: v.union(
        v.literal("DESTROY_TARGET"),
        v.literal("STUN"),
        v.literal("LONG_STUN"),
        v.literal("EXTRA_LONG_STUN"),
        v.literal("BOOST_ALL_ALLIES"),
        v.literal("HEAL_ALLIES"),
        v.literal("MULTIPLE_TARGETS"),
        v.literal("REVIVE"),
        v.literal("REUSE"),
        v.literal("MULTIPLE_TURNS")
      ),
      description: v.string(),
      value: v.optional(v.number()), // For stun duration, heal amount, etc.
    }).index("by_name_normalized", ["name_normalized"]),

    userCards: defineTable({
      userId: v.id("users"),
      cardId: v.id("cards"),
    })
      .index("by_user_card", ["userId", "cardId"])
      .index("by_userId", ["userId"])
      .index("by_cardId", ["cardId"]),
      
    blogs: defineTable({
      title: v.string(),
      slug: v.string(),
      content: v.string(), // Will use markdown
      authorId: v.id("users"),
      imageUrl: v.optional(v.string()),
      metaDescription: v.optional(v.string()),
      metaKeywords: v.optional(v.string()),
    }).index("by_slug", ["slug"]),
  },
  {
    schemaValidation: false,
  }
);

export default schema;