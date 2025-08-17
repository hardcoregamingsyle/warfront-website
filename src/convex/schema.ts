import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
  GUEST: "guest",
  OWNER: "owner",
  STAFF: "staff",
  TEST: "test",
  CARDSETTER: "cardsetter",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
  v.literal(ROLES.GUEST),
  v.literal(ROLES.OWNER),
  v.literal(ROLES.STAFF),
  v.literal(ROLES.TEST),
  v.literal(ROLES.CARDSETTER)
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
    })
      .index("by_email", ["email"])
      .index("by_name_for_uniqueness", ["name"])
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
      .index("by_playerIds", ["playerIds"]),
  },
  {
    schemaValidation: false,
  }
);

export default schema;