import { internalMutation } from "../_generated/server";

export const nuclearCleanup = internalMutation({
  args: {},
  handler: async (ctx) => {
    console.log("🚨 NUCLEAR CLEANUP: Deleting ALL data from ALL tables...");
    
    // Get all table names from the database
    const allTables = [
      "users", 
      "accounts", 
      "sessions", 
      "authSessions",
      "authAccounts", 
      "authVerificationCodes",
      "verificationCodes",
      "pendingUsers"
    ];
    
    let totalDeleted = 0;
    
    for (const tableName of allTables) {
      try {
        const docs = await ctx.db.query(tableName as any).collect();
        console.log(`Found ${docs.length} documents in table "${tableName}"`);
        
        for (const doc of docs) {
          await ctx.db.delete(doc._id);
          totalDeleted++;
        }
        
        console.log(`✅ Deleted ${docs.length} documents from "${tableName}"`);
      } catch (error) {
        console.log(`⚠️ Table "${tableName}" does not exist or error: ${error}`);
      }
    }
    
    console.log(`🎯 NUCLEAR CLEANUP COMPLETE: Deleted ${totalDeleted} total documents`);
    return `Nuclear cleanup complete. Deleted ${totalDeleted} documents.`;
  },
});
