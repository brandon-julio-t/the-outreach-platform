import { ConvexError, v } from "convex/values";
import { workflow } from "../..";
import { internal } from "../../_generated/api";
import { mutation } from "../../_generated/server";
import { r2 } from "../../r2";
import { ensureUserWithOrgId } from "../core/ensureUserWithOrgId";
import { getOrgTwilioSettings } from "../core/getOrgTwilioSettings";

export const createTwilioMessageTemplate = mutation({
  args: {
    name: v.string(),
    messageLanguage: v.string(),
    messageTemplate: v.string(),
    messageVariables: v.record(v.string(), v.string()),
    messageMedia: v.optional(v.string()),
    messageMediaFileKey: v.optional(v.string()),
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

export const deleteTwilioMessageTemplate = mutation({
  args: {
    id: v.id("twilioMessageTemplates"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    console.log("args", args);

    const user = await ensureUserWithOrgId({ ctx });
    console.log("user", user);

    const twilioSettings = await getOrgTwilioSettings({
      ctx,
      organizationId: user.organizationId,
    });
    console.log("twilioSettings", twilioSettings);
    if (!twilioSettings) {
      throw new ConvexError("Twilio settings not found");
    }

    const twilioMessageTemplate = await ctx.db.get(args.id);
    console.log("twilioMessageTemplate", twilioMessageTemplate);
    if (!twilioMessageTemplate) {
      throw new ConvexError("Twilio message template not found");
    }

    if (twilioMessageTemplate.messageMediaFileKey) {
      console.log(
        "deleting media file",
        twilioMessageTemplate.messageMediaFileKey,
      );
      await r2.deleteObject(ctx, twilioMessageTemplate.messageMediaFileKey);
      console.log("media file deleted");
    }

    const jobId = await workflow.start(
      ctx,
      internal.domains.twilioMessageTemplates.workflows
        .deleteTwilioMessageTemplateWorkflow,
      {
        accountSid: twilioSettings.accountSid,
        authToken: twilioSettings.authToken,
        twilioMessageTemplateId: args.id,
      },
    );

    console.log("jobId", jobId);
  },
});

export const checkWhatsAppApprovalStatus = mutation({
  args: {
    id: v.id("twilioMessageTemplates"),
  },
  handler: async (ctx, args) => {
    console.log("args", args);

    const user = await ensureUserWithOrgId({ ctx });
    console.log("user", user);

    const twilioSettings = await getOrgTwilioSettings({
      ctx,
      organizationId: user.organizationId,
    });
    console.log("twilioSettings", twilioSettings);
    if (!twilioSettings) {
      throw new ConvexError("Twilio settings not found");
    }

    const twilioMessageTemplate = await ctx.db.get(args.id);
    console.log("twilioMessageTemplate", twilioMessageTemplate);
    if (!twilioMessageTemplate) {
      throw new ConvexError("Twilio message template not found");
    }
    if (!twilioMessageTemplate.twilioContentSid) {
      throw new ConvexError("Twilio content SID not found");
    }

    const workflowId = await workflow.start(
      ctx,
      internal.domains.twilioMessageTemplates.workflows
        .checkWhatsAppApprovalStatusWorkflow,
      {
        accountSid: twilioSettings.accountSid,
        authToken: twilioSettings.authToken,
        twilioMessageTemplateId: args.id,
        twilioContentSid: twilioMessageTemplate.twilioContentSid,
      },
    );

    console.log("workflowId", workflowId);
  },
});
