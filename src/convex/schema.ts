import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.string(),
      emailVerificationTime: v.optional(v.number()),
      
      role: roleValidator,

      // Custom fields for signup
      username: v.string(),
      password: v.string(), // This will be a hashed password
      twoFactorEnabled: v.optional(v.boolean()),
      gender: v.optional(v.string()),
      dob: v.optional(v.string()),
      region: v.optional(v.string()),
    })
      .index("email", ["email"])
      .index("username", ["username"]),

    battles: defineTable({
      hostId: v.id("users"),
      opponentId: v.optional(v.id("users")),
      status: v.union(
        v.literal("Open"),
        v.literal("Full"),
        v.literal("In Progress"),
        v.literal("Finished"),
      ),
    }).index("by_status", ["status"])
    .index("by_hostId_and_status", ["hostId", "status"]),

    multiplayerBattles: defineTable({
      hostId: v.id("users"),
      playerIds: v.array(v.id("users")),
      maxPlayers: v.number(),
      status: v.union(
        v.literal("Waiting"),
        v.literal("In Progress"),
        v.literal("Finished"),
      ),
    }).index("by_status", ["status"]),

    sessions: defineTable({
      userId: v.id("users"),
      token: v.string(),
      expires: v.number(),
    }).index("by_token", ["token"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;