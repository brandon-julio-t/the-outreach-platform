import { v } from "convex/values";
import { workflow } from "../..";
import { internal } from "../../_generated/api";

export const createTwilioMessageTemplateWorkflow = workflow.define({
  args: {
    accountSid: v.string(),
    authToken: v.string(),
    organizationId: v.id("organizations"),
    twilioMessageTemplateId: v.id("twilioMessageTemplates"),

    name: v.string(),
    messageLanguage: v.string(),
    messageTemplate: v.string(),
    messageVariables: v.record(v.string(), v.string()),
    messageMedia: v.optional(v.string()),
    messageMediaFileKey: v.optional(v.string()),
    messageCategory: v.union(v.literal("marketing"), v.literal("utility")),
  },
  handler: async (step, args) => {
    console.log("args", args);
    console.log("step", step);

    await step.runMutation(
      internal.domains.twilioMessageTemplates.internalCrud.update,
      {
        id: args.twilioMessageTemplateId,
        patch: {
          workflowId: step.workflowId,
          lastUpdatedAt: Date.now(),
        },
      },
    );

    const createResponse = await step.runAction(
      internal.domains.twilioMessageTemplates.internalActions
        .createTwilioCardMessageTemplateAction,
      {
        accountSid: args.accountSid,
        authToken: args.authToken,
        name: args.name,
        language: args.messageLanguage,
        variables: args.messageVariables,
        cardData: {
          body: args.messageTemplate,
          media: args.messageMedia,
          actions: [],
        },
      },
    );

    console.log("createResponse", createResponse);

    const twilioContentSid = createResponse.json?.sid ?? undefined;

    console.log("twilioContentSid", twilioContentSid);

    await step.runMutation(
      internal.domains.twilioMessageTemplates.internalCrud.update,
      {
        id: args.twilioMessageTemplateId,
        patch: {
          twilioContentSid: twilioContentSid,
          twilioStatus: createResponse.ok ? "success" : "error",
          twilioResponseJson: createResponse.json,
          lastUpdatedAt: Date.now(),
        },
      },
    );

    if (!twilioContentSid) {
      console.error("twilioContentSid is undefined", { twilioContentSid });
      return;
    }

    const requestApprovalResponse = await step.runAction(
      internal.domains.twilioMessageTemplates.internalActions
        .submitWhatsAppApprovalRequestAction,
      {
        accountSid: args.accountSid,
        authToken: args.authToken,
        twilioContentSid: twilioContentSid,
        name: args.name,
        messageCategory: args.messageCategory,
      },
    );

    console.log("requestApprovalResponse", requestApprovalResponse);

    await step.runMutation(
      internal.domains.twilioMessageTemplates.internalCrud.update,
      {
        id: args.twilioMessageTemplateId,
        patch: {
          whatsAppApprovalStatus: requestApprovalResponse.ok
            ? requestApprovalResponse.json.status
            : "error",
          whatsAppApprovalResponseJson: requestApprovalResponse.json,
          lastUpdatedAt: Date.now(),
        },
      },
    );
  },
});

export const deleteTwilioMessageTemplateWorkflow = workflow.define({
  args: {
    accountSid: v.string(),
    authToken: v.string(),
    twilioMessageTemplateId: v.id("twilioMessageTemplates"),
  },
  handler: async (step, args) => {
    console.log("args", args);
    console.log("step", step);

    const twilioMessageTemplate = await step.runQuery(
      internal.domains.twilioMessageTemplates.internalCrud.read,
      {
        id: args.twilioMessageTemplateId,
      },
    );

    console.log("twilioMessageTemplate", twilioMessageTemplate);

    if (!twilioMessageTemplate) {
      console.error("twilioMessageTemplate not found", {
        twilioMessageTemplateId: args.twilioMessageTemplateId,
      });
      return;
    }

    const twilioContentSid = twilioMessageTemplate.twilioContentSid;

    console.log("twilioContentSid", twilioContentSid);

    if (!twilioContentSid) {
      console.error("twilioContentSid is undefined", { twilioContentSid });
      return;
    }

    const deleteResponse = await step.runAction(
      internal.domains.twilioMessageTemplates.internalActions
        .deleteTwilioMessageTemplateAction,
      {
        accountSid: args.accountSid,
        authToken: args.authToken,
        twilioContentSid: twilioContentSid,
      },
    );

    console.log("deleteResponse", deleteResponse);

    await step.runMutation(
      internal.domains.twilioMessageTemplates.internalCrud.destroy,
      {
        id: args.twilioMessageTemplateId,
      },
    );
  },
});
