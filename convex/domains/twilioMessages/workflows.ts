import { v } from "convex/values";
import { workflow } from "../..";
import { internal } from "../../_generated/api";

export const sendWhatsAppMessageViaTwilioWorkflow = workflow.define({
  args: {
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    displayName: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    contactId: v.optional(v.id("contacts")),
    twilioMessageBroadcastId: v.optional(v.id("twilioMessageBroadcasts")),

    accountSid: v.string(),
    authToken: v.string(),
    from: v.string(),
    to: v.string(),
    contentSid: v.string(),
    contentVariables: v.record(v.string(), v.string()),
  },
  handler: async (step, args): Promise<void> => {
    console.log("step.workflowId", step.workflowId);
    console.log("args", args);

    const twilioMessage = await step.runMutation(
      internal.domains.twilioMessages.internalCrud.create,
      {
        organizationId: args.organizationId,
        userId: args.userId,
        displayName: args.displayName,
        role: args.role,
        contactId: args.contactId,
        twilioMessageBroadcastId: args.twilioMessageBroadcastId,

        from: args.from,
        to: args.to,
        body: args.contentSid,
        messageSid: "",
        accountSid: args.accountSid,
        apiVersion: "",
        direction: "",
        status: "queued",

        workflowId: step.workflowId,
        lastUpdatedAt: Date.now(),
      },
    );

    console.log("twilioMessage", twilioMessage);

    const response = await step.runAction(
      internal.domains.twilioSettings.actions
        .sendWhatsAppMessageViaTwilioAction,
      {
        accountSid: args.accountSid,
        authToken: args.authToken,
        from: args.from,
        to: args.to,
        contentSid: args.contentSid,
        contentVariables: args.contentVariables,
      },
    );

    console.log("response", response);

    await step.runMutation(
      internal.domains.twilioMessages.internalCrud.update,
      {
        id: twilioMessage._id,
        patch: {
          body: response.body,
          messageSid: response.sid,
          apiVersion: response.api_version,
          direction: response.direction,
          errorCode: response.error_code?.toString() ?? undefined,
          errorMessage: response.error_message ?? undefined,
          status: response.status,

          rawResponseJson: response,
          lastUpdatedAt: Date.now(),
        },
      },
    );
  },
});
