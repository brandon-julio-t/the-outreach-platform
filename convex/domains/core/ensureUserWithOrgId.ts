import { getAuthSessionId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import { MutationCtx, QueryCtx } from "../../_generated/server";

export async function ensureUserWithOrgId({
  ctx,
}: {
  ctx: QueryCtx | MutationCtx;
}) {
  const sessionId = await getAuthSessionId(ctx);
  console.log("sessionId", sessionId);
  if (!sessionId) {
    throw new ConvexError("Session not authenticated");
  }

  const session = await ctx.db.get(sessionId);
  console.log("session", session);
  if (!session) {
    throw new ConvexError("User not found");
  }

  const user = await ctx.db.get(session.userId);
  console.log("user", user);
  if (!user) {
    throw new ConvexError("User not found");
  }

  const organizationId = session.organizationId;
  console.log("organizationId", organizationId);
  if (!organizationId) {
    throw new ConvexError("User is not associated with an organization");
  }

  return {
    ...user,
    organizationId,
  };
}
