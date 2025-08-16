import { action } from "./_generated/server";

// Simple seed function that can be used if needed later
export const createTestData = action({
  args: {},
  handler: async (ctx) => {
    return "Seed functionality removed - use the auth system to create accounts";
  },
});