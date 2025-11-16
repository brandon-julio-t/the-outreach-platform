import { v } from "convex/values";
import { workflow } from "../..";
import { internal } from "../../_generated/api";

export const sendWhatsAppMessageViaTwilioWorkflow = workflow.define({
  args: {
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    displayName: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    twilioMessageId: v.id("twilioMessages"),

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

    await step.runMutation(
      internal.domains.twilioMessages.internalCrud.update,
      {
        id: args.twilioMessageId,
        patch: {
          workflowId: step.workflowId,
          lastUpdatedAt: Date.now(),
        },
      },
    );

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
        id: args.twilioMessageId,
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
