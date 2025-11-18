import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { query } from "../../_generated/server";

export const getTwilioMessageTemplates = query({
  args: {
    organizationId: v.id("organizations"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("twilioMessageTemplates")
      .withIndex("by_organizationId", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
