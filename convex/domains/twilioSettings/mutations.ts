import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { ensureUserWithOrgId } from "../core/ensureUserWithOrgId";

export const upsertTwilioSettings = mutation({
  args: {
    accountSid: v.string(),
    authToken: v.string(),
    phoneNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ensureUserWithOrgId({ ctx });

    const existing = await ctx.db
      .query("twilioSettings")
      .withIndex("by_organizationId_accountSid", (q) =>
        q
          .eq("organizationId", user.organizationId)
          .eq("accountSid", args.accountSid),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
      });
    } else {
      await ctx.db.insert("twilioSettings", {
        ...args,
        organizationId: user.organizationId,
      });
    }
  },
});
