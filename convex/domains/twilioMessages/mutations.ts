import { ConvexError, v } from "convex/values";
import { workflow } from "../..";
import { internal } from "../../_generated/api";
import { mutation } from "../../_generated/server";
import { ensureUserWithOrgId } from "../core/ensureUserWithOrgId";

export const sendWhatsAppMessageViaTwilio = mutation({
  args: {
    receiverPhoneNumber: v.string(),
    contentSid: v.string(),
    contentVariables: v.record(v.string(), v.string()),
  },
  handler: async (ctx, args) => {
    console.log("args", args);

    const user = await ensureUserWithOrgId({ ctx });

    const twilioSettings = await ctx.db
      .query("twilioSettings")
      .withIndex("by_organizationId_accountSid", (q) =>
        q.eq("organizationId", user.organizationId),
      )
      .first();

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
        role: "user",

        accountSid: twilioSettings.accountSid,
        authToken: twilioSettings.authToken,
        from: twilioSettings.phoneNumber,
        to: args.receiverPhoneNumber,
        contentSid: args.contentSid,
        contentVariables: args.contentVariables,
      },
    );
  },
});
