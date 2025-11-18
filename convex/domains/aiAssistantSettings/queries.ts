import { v } from "convex/values";
import { query } from "../../_generated/server";

export const getActiveOrgAiAssistantSettings = query({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("aiAssistantSettings")
      .withIndex("by_organizationId", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .first();
  },
});
