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
      
      role: v.optional(roleValidator),

      // Custom fields for signup
      username: v.string(),
      gender: v.optional(v.string()),
      dob: v.optional(v.string()), // Date of Birth
      region: v.optional(v.string()),
      password: v.string(), // This will be a hashed password
      twoFactorEnabled: v.optional(v.boolean()),
    })
      .index("email", ["email"])
      .index("username", ["username"]),

    pendingUsers: defineTable({
      username: v.string(),
      email: v.string(),
      password: v.string(), // Hashed password
      gender: v.optional(v.string()),
      dob: v.optional(v.string()),
      region: v.optional(v.string()),
      otp: v.string(),
      otpExpires: v.number(), // Expiration timestamp
    }).index("email", ["email"]),

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