import { mutation } from "./_generated/server";

export const deleteAll = mutation({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const userDeletions = users.map(user => ctx.db.delete(user._id));
    await Promise.all(userDeletions);

    const sessions = await ctx.db.query("sessions").collect();
    const sessionDeletions = sessions.map(session => ctx.db.delete(session._id));
    await Promise.all(sessionDeletions);

    const pendingUsers = await ctx.db.query("pendingUsers").collect();
    const pendingUserDeletions = pendingUsers.map(pendingUser => ctx.db.delete(pendingUser._id));
    await Promise.all(pendingUserDeletions);

    console.log(`Deleted ${users.length} users, ${sessions.length} sessions, and ${pendingUsers.length} pending users.`);
    return `Deleted ${users.length} users, ${sessions.length} sessions, and ${pendingUsers.length} pending users.`;
  },
});
