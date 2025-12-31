import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export async function validateSession(
  ctx: QueryCtx | MutationCtx,
  token: string
): Promise<{ userId: Id<"users">; expires: number } | null> {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .unique();

  if (!session || session.expires < Date.now()) {
    return null;
  }

  return session;
}

export async function validatePrivilegedUser(
  ctx: MutationCtx,
  token: string
): Promise<{ user: any; session: any }> {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .unique();

  if (!session || session.expires < Date.now()) {
    throw new Error("Invalid or expired session");
  }

  const user = await ctx.db.get(session.userId);
  if (!user) {
    throw new Error("Unauthorized");
  }

  const roleNorm = (user.role ?? "")
    .toString()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
  const emailNorm = (user.email ?? "").toString().toLowerCase();
  const isPrivileged =
    ["admin", "owner", "cardsetter"].includes(roleNorm) ||
    emailNorm === "hardcorgamingstyle@gmail.com";

  if (!isPrivileged) {
    throw new Error("Unauthorized");
  }

  return { user, session };
}
