import { ConvexError, v } from "convex/values";
import { workflow } from "../..";
import { internal } from "../../_generated/api";
import { mutation } from "../../_generated/server";
import { ensureUserWithOrgId } from "../core/ensureUserWithOrgId";
import { getOrgTwilioSettings } from "../core/getOrgTwilioSettings";

export const sendWhatsAppMessageViaTwilio = mutation({
  args: {
    contactId: v.optional(v.id("contacts")),
    receiverPhoneNumber: v.string(),
    body: v.optional(v.string()),
    contentSid: v.optional(v.string()),
    contentVariables: v.optional(v.record(v.string(), v.string())),
  },
  handler: async (ctx, args) => {
    console.log("args", args);

    const user = await ensureUserWithOrgId({ ctx });

    const twilioSettings = await getOrgTwilioSettings({
      ctx,
      organizationId: user.organizationId,
    });

    if (!twilioSettings) {
      throw new ConvexError("Twilio settings not found");
    }

    await workflow.start(
      ctx,
      internal.domains.twilioMessages.workflows
        .sendWhatsAppMessageViaTwilioWorkflow,
      {
        organizationId: user.organizationId,
        userId: user._id,
        displayName: user.email ?? user.phone ?? "Unknown",
        role: "assistant",
        contactId: args.contactId,

        accountSid: twilioSettings.accountSid,
        authToken: twilioSettings.authToken,
        from: twilioSettings.phoneNumber,
        to: args.receiverPhoneNumber,
        body: args.body,
        contentSid: args.contentSid,
        contentVariables: args.contentVariables,
      },
    );
  },
});
