import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import { MutationCtx, QueryCtx } from "../../_generated/server";

export async function ensureUserWithOrgId({
  ctx,
}: {
  ctx: QueryCtx | MutationCtx;
}) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new ConvexError("User not authenticated");
  }

  const user = await ctx.db.get(userId);
  if (!user) {
    throw new ConvexError("User not found");
  }

  const organizationId = user.organizationId;
  if (!organizationId) {
    throw new ConvexError("User is not associated with an organization");
  }

  return {
    ...user,
    organizationId,
  };
}
