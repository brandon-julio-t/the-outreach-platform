import { query } from "../../_generated/server";
import { ensureUserWithOrgId } from "../core/ensureUserWithOrgId";

export const getTwilioSettings = query({
  args: {
    //
  },
  handler: async (ctx) => {
    const user = await ensureUserWithOrgId({ ctx });

    return await ctx.db
      .query("twilioSettings")
      .withIndex("by_organizationId_accountSid", (q) =>
        q.eq("organizationId", user.organizationId),
      )
      .first();
  },
});
