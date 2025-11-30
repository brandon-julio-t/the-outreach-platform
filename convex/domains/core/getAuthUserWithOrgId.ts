import { getAuthSessionId } from "@convex-dev/auth/server";
import type { MutationCtx, QueryCtx } from "../../_generated/server";

export async function getAuthUserWithOrgId({
  ctx,
}: {
  ctx: QueryCtx | MutationCtx;
}) {
  const sessionId = await getAuthSessionId(ctx);
  console.log("sessionId", sessionId);
  if (!sessionId) {
    console.warn("Session not authenticated");
    return null;
  }

  const session = await ctx.db.get(sessionId);
  console.log("session", session);
  if (!session) {
    console.warn("Session not found");
    return null;
  }

  const user = await ctx.db.get(session.userId);
  console.log("user", user);
  if (!user) {
    console.warn("User not found");
    return null;
  }

  const organizationId = session.organizationId;
  console.log("organizationId", organizationId);
  if (!organizationId) {
    console.warn("User is not associated with an organization");
    return null;
  }

  return {
    ...user,
    organizationId,
  };
  // const userId = await getAuthUserId(ctx);
  // console.log("userId", userId);
  // if (!userId) {
  //   console.warn("User not authenticated");
  //   return null;
  // }

  // const user = await ctx.db.get(userId);
  // console.log("user", user);
  // if (!user) {
  //   console.warn("User not found");
  //   return null;
  // }

  // const organizationId = user.organizationId;
  // console.log("organizationId", organizationId);
  // if (!organizationId) {
  //   console.warn("User is not associated with an organization");
  //   return null;
  // }

  // return {
  //   ...user,
  //   organizationId,
  // };
}
