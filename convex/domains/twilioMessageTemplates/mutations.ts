import { ConvexError, v } from "convex/values";
import { workflow } from "../..";
import { internal } from "../../_generated/api";
import { mutation } from "../../_generated/server";
import { ensureUserWithOrgId } from "../core/ensureUserWithOrgId";
import { getOrgTwilioSettings } from "../core/getOrgTwilioSettings";

export const createTwilioMessageTemplate = mutation({
  args: {
    name: v.string(),
    messageLanguage: v.string(),
    messageTemplate: v.string(),
    messageVariables: v.record(v.string(), v.string()),
    messageMedia: v.optional(v.string()),
    messageCategory: v.union(v.literal("marketing"), v.literal("utility")),
  },
  handler: async (ctx, args) => {
    const user = await ensureUserWithOrgId({ ctx });

    const twilioSettings = await getOrgTwilioSettings({
      ctx,
      organizationId: user.organizationId,
    });
    if (!twilioSettings) {
      throw new ConvexError("Twilio settings not found");
    }

    const twilioMessageTemplateId = await ctx.db.insert(
      "twilioMessageTemplates",
      {
        ...args,
        organizationId: user.organizationId,
      },
    );

    await workflow.start(
      ctx,
      internal.domains.twilioMessageTemplates.workflows
        .createTwilioMessageTemplateWorkflow,
      {
        ...args,
        accountSid: twilioSettings.accountSid,
        authToken: twilioSettings.authToken,
        organizationId: user.organizationId,
        twilioMessageTemplateId,
      },
    );
  },
});
