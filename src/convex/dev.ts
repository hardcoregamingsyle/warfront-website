import { mutation } from "./_generated/server";

export const deleteAll = mutation({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const userDeletions = users.map(user => ctx.db.delete(user._id));
    await Promise.all(userDeletions);

    console.log(`Deleted ${users.length} users.`);
    return `Deleted ${users.length} users.`;
  },
});