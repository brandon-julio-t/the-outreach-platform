import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import schema from "../../schema";
import { ensureUserWithOrgId } from "../core/ensureUserWithOrgId";

export const upsertAiAssistantSettings = mutation({
  args: {
    modelId: schema.tables.aiAssistantSettings.validator.fields.modelId,
    systemPrompt: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ensureUserWithOrgId({ ctx });

    const existing = await ctx.db
      .query("aiAssistantSettings")
      .withIndex("by_organizationId", (q) =>
        q.eq("organizationId", user.organizationId),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
      });
    } else {
      await ctx.db.insert("aiAssistantSettings", {
        ...args,
        organizationId: user.organizationId,
      });
    }
  },
});
