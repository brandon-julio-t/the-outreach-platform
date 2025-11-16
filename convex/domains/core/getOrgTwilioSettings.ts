import { Id } from "../../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../../_generated/server";

export async function getOrgTwilioSettings({
  ctx,
  organizationId,
}: {
  ctx: QueryCtx | MutationCtx;
  organizationId: Id<"organizations">;
}) {
  return await ctx.db
    .query("twilioSettings")
    .withIndex("by_organizationId", (q) =>
      q.eq("organizationId", organizationId),
    )
    .first();
}
