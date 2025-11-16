import { v } from "convex/values";
import { internalQuery } from "../../_generated/server";

export const getAiAssistantSettingsByOrganizationId = internalQuery({
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
