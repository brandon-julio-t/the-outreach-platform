import { ConvexError, v } from "convex/values";
import { workflow } from "../..";
import { internal } from "../../_generated/api";

export const sendWhatsAppMessageViaTwilioWorkflow = workflow.define({
  args: {
    organizationId: v.id("organizations"),
    displayName: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    userId: v.optional(v.id("users")),
    contactId: v.optional(v.id("contacts")),
    twilioMessageBroadcastId: v.optional(v.id("twilioMessageBroadcasts")),

    accountSid: v.string(),
    authToken: v.string(),
    from: v.string(),
    to: v.string(),
    body: v.optional(v.string()),
    contentSid: v.optional(v.string()),
    contentVariables: v.optional(v.record(v.string(), v.string())),
  },
  handler: async (step, args): Promise<void> => {
    console.log("step.workflowId", step.workflowId);
    console.log("args", args);

    const virtualPhone = "+18777804236";
    const shouldWhatsApp = args.contactId && args.to !== virtualPhone;
    const normalizedFrom =
      shouldWhatsApp && !args.from.startsWith("whatsapp:")
        ? "whatsapp:" + args.from
        : args.from;
    const normalizedTo =
      shouldWhatsApp && !args.to.startsWith("whatsapp:")
        ? "whatsapp:" + args.to
        : args.to;

    const twilioMessage = await step.runMutation(
      internal.domains.twilioMessages.internalCrud.create,
      {
        organizationId: args.organizationId,
        userId: args.userId,
        displayName: args.displayName,
        role: args.role,
        contactId: args.contactId,
        twilioMessageBroadcastId: args.twilioMessageBroadcastId,

        from: normalizedFrom,
        to: normalizedTo,
        body: args.body ?? args.contentSid ?? "",
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
        from: normalizedFrom,
        to: normalizedTo,
        body: args.body,
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

    if (args.contactId) {
      await step.runMutation(internal.domains.contacts.internalCrud.update, {
        id: args.contactId,
        patch: {
          latestMessageTime: Date.now(),
        },
      });
    }
  },
});

export const handleIncomingWhatsAppMessageWorkflow = workflow.define({
  args: {
    from: v.string(),
    to: v.string(),
    messageText: v.string(),
    profileName: v.string(),
    accountSid: v.string(),
    messageSid: v.string(),
    apiVersion: v.string(),
  },
  handler: async (step, args): Promise<void> => {
    console.log("args", args);
    console.log("step", step);

    const twilioSettings = await step.runQuery(
      internal.domains.twilioSettings.internalQueries
        .getTwilioSettingsByAccountSid,
      {
        accountSid: args.accountSid,
      },
    );

    console.log("twilioSettings", twilioSettings);

    if (!twilioSettings) {
      throw new ConvexError("Twilio settings not found");
    }

    const normalizedFromPhone = args.from.replace("whatsapp:", "");

    let contact = await step.runQuery(
      internal.domains.contacts.internalQueries.getContactByPhone,
      {
        phone: normalizedFromPhone,
      },
    );

    console.log("contact", contact);

    if (!contact) {
      contact = await step.runMutation(
        internal.domains.contacts.internalCrud.create,
        {
          organizationId: twilioSettings.organizationId,
          name: args.profileName,
          phone: normalizedFromPhone,
          lastUserReplyTime: Date.now(),
        },
      );
    } else {
      await step.runMutation(internal.domains.contacts.internalCrud.update, {
        id: contact._id,
        patch: {
          lastUserReplyTime: Date.now(),
        },
      });
    }

    const twilioMessage = await step.runMutation(
      internal.domains.twilioMessages.internalCrud.create,
      {
        organizationId: twilioSettings.organizationId,
        displayName: args.profileName,
        role: "user",
        contactId: contact._id,

        from: args.from,
        to: args.to,
        body: args.messageText,
        messageSid: args.messageSid,
        accountSid: args.accountSid,
        apiVersion: args.apiVersion,
        direction: "inbound-api",
        status: "received",

        workflowId: step.workflowId,
        lastUpdatedAt: Date.now(),
      },
    );

    console.log("twilioMessage", twilioMessage);

    await step.runAction(
      internal.domains.twilioMessages.internalActions.generateAssistantReply,
      {
        contactId: contact._id,
        contactPhone: normalizedFromPhone,
        organizationId: twilioSettings.organizationId,
        accountSid: twilioSettings.accountSid,
        authToken: twilioSettings.authToken,
        senderPhone: twilioSettings.phoneNumber,
      },
    );
  },
});
