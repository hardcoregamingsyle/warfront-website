import { query } from "./_generated/server";

// Simple helper for custom auth - not used in current implementation
export const placeholder = query({
  args: {},
  handler: async (ctx) => {
    return null;
  },
});