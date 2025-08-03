import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const deleteAllUsers = internalMutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    
    let deletedCount = 0;
    for (const user of users) {
      await ctx.db.delete(user._id);
      deletedCount++;
    }
    
    return deletedCount;
  },
});
