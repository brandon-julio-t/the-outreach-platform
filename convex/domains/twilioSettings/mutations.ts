import { ConvexError, v } from "convex/values";
import { mutation } from "../../_generated/server";
import { ensureUserWithOrgId } from "../core/ensureUserWithOrgId";
import { internal } from "../../_generated/api";

export const upsertTwilioSettings = mutation({
  args: {
    accountSid: v.string(),
    authToken: v.string(),
    phoneNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ensureUserWithOrgId({ ctx });

    const existing = await ctx.db
      .query("twilioSettings")
      .withIndex("by_organizationId_accountSid", (q) =>
        q
          .eq("organizationId", user.organizationId)
          .eq("accountSid", args.accountSid),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
      });
    } else {
      await ctx.db.insert("twilioSettings", {
        ...args,
        organizationId: user.organizationId,
      });
    }
  },
});

export const sendTestMessage = mutation({
  args: {
    receiverPhoneNumber: v.string(),
    contentSid: v.string(),
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

    await ctx.scheduler.runAfter(
      0,
      internal.domains.twilioSettings.actions
        .sendWhatsAppMessageViaTwilioAction,
      {
        accountSid: twilioSettings.accountSid,
        authToken: twilioSettings.authToken,
        from: twilioSettings.phoneNumber,
        to: args.receiverPhoneNumber,
        contentSid: args.contentSid,
      },
    );
  },
});
