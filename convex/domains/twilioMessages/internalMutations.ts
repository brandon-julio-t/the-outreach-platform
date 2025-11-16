import { ConvexError, Infer, v } from "convex/values";
import { internalMutation } from "../../_generated/server";
import schema from "../../schema";

type MessageStatus = Infer<
  typeof schema.tables.twilioMessages.validator.fields.status
>;

export const updateTwilioMessageStatusFromWebhook = internalMutation({
  args: {
    messageSid: v.string(),
    accountSid: v.string(),
    messageStatus: v.string(),
    errorCode: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("args", args);

    const twilioMessage = await ctx.db
      .query("twilioMessages")
      .withIndex("by_accountSid_messageSid", (q) =>
        q.eq("accountSid", args.accountSid).eq("messageSid", args.messageSid),
      )
      .unique();

    if (!twilioMessage) {
      throw new ConvexError("Twilio message not found");
    }

    await ctx.db.patch(twilioMessage._id, {
      status: args.messageStatus as MessageStatus,
      errorCode: args.errorCode ?? undefined,
      errorMessage: args.errorMessage ?? undefined,
      lastUpdatedAt: Date.now(),
    });
  },
});
