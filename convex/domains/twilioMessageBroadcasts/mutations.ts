import { ConvexError, v } from "convex/values";
import { workflow } from "../..";
import { internal } from "../../_generated/api";
import { Doc } from "../../_generated/dataModel";
import { mutation } from "../../_generated/server";
import { ensureUserWithOrgId } from "../core/ensureUserWithOrgId";
import { getOrgTwilioSettings } from "../core/getOrgTwilioSettings";

export const broadcastWhatsAppMessagesViaTwilio = mutation({
  args: {
    twilioMessageTemplateId: v.id("twilioMessageTemplates"),
    contentVariables: v.record(v.string(), v.string()),
    contacts: v.array(
      v.object({
        id: v.optional(v.id("contacts")),
        phone: v.string(),
      }),
    ),
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

    const twilioMessageTemplate = await ctx.db.get(
      args.twilioMessageTemplateId,
    );
    console.log("twilioMessageTemplate", twilioMessageTemplate);
    if (!twilioMessageTemplate) {
      throw new ConvexError("Twilio message template not found");
    }
    if (!twilioMessageTemplate.twilioContentSid) {
      throw new ConvexError("Twilio content SID not found");
    }

    const twilioMessageBroadcastId = await ctx.db.insert(
      "twilioMessageBroadcasts",
      {
        organizationId: user.organizationId,
        userId: user._id,
        twilioMessageTemplateId: args.twilioMessageTemplateId,
        contentSid: twilioMessageTemplate.twilioContentSid,
        contentVariables: args.contentVariables,
      },
    );

    for (const contactData of args.contacts) {
      let contact: Doc<"contacts"> | null = null;
      if (contactData.id) {
        contact = await ctx.db.get(contactData.id);
      } else {
        contact = await ctx.db
          .query("contacts")
          .withIndex("by_organizationId_phone", (q) =>
            q
              .eq("organizationId", user.organizationId)
              .eq("phone", contactData.phone),
          )
          .first();
      }

      console.log("contact", contact);

      if (!contact) {
        console.error("Contact not found", { contactData });
        continue;
      }

      const workflowId = await workflow.start(
        ctx,
        internal.domains.twilioMessages.workflows
          .sendWhatsAppMessageViaTwilioWorkflow,
        {
          organizationId: user.organizationId,
          userId: user._id,
          displayName: user.email ?? user.phone ?? "Unknown",
          role: "assistant",
          contactId: contact._id,
          twilioMessageTemplateId: args.twilioMessageTemplateId,
          twilioMessageBroadcastId,

          accountSid: twilioSettings.accountSid,
          authToken: twilioSettings.authToken,
          from: twilioSettings.phoneNumber,
          to: contact.phone,
          contentSid: twilioMessageTemplate.twilioContentSid,
          contentVariables: args.contentVariables,
        },
        {
          startAsync: true,
        },
      );

      console.log("workflowId", workflowId);
    }
  },
});
