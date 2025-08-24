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
      imageId: v.optional(v.id("_storage")),
      rarity: v.optional(v.string()),
      frame: v.optional(v.string()),
      batch: v.optional(v.string()),
      numberingA: v.optional(v.number()),
      numberingB: v.optional(v.number()),
      signed: v.optional(v.string()),
    }).index("by_customId", ["customId"]),

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