import { v } from "convex/values";
import { internalQuery } from "../../_generated/server";

export const getTwilioSettingsByAccountSid = internalQuery({
  args: {
    accountSid: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("args", args);

    return await ctx.db
      .query("twilioSettings")
      .withIndex("by_accountSid", (q) => q.eq("accountSid", args.accountSid))
      .first();
  },
});
