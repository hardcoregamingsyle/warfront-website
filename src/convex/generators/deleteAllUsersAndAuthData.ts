import { internalMutation } from "../_generated/server";

export const deleteAllUsersAndAuthData = internalMutation({
  handler: async (ctx) => {
    // A list of all tables to wipe to ensure a clean state
    const tablesToWipe: string[] = ["users", "accounts", "sessions"];
    let totalDeleted = 0;

    console.log("Starting cleanup of user and auth data...");

    for (const tableName of tablesToWipe) {
      const documents = await ctx.db.query(tableName as any).collect();
      let deletedInTable = 0;
      for (const document of documents) {
        await ctx.db.delete(document._id);
        deletedInTable++;
      }
      console.log(`- Deleted ${deletedInTable} documents from "${tableName}"`);
      totalDeleted += deletedInTable;
    }
    
    const message = `Success! Deleted a total of ${totalDeleted} documents from ${tablesToWipe.join(", ")}. The database is now in a clean state.`;
    console.log(message);
    return message;
  },
});
