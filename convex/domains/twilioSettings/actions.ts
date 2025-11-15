import { v } from "convex/values";
import { internalAction } from "../../_generated/server";
import { sendWhatsAppMessageViaTwilio } from "../core/twilio";

export const sendWhatsAppMessageViaTwilioAction = internalAction({
  args: {
    accountSid: v.string(),
    authToken: v.string(),
    from: v.string(),
    to: v.string(),
    contentSid: v.string(),
  },
  handler: async (_ctx, args) => {
    console.log("args", args);

    return await sendWhatsAppMessageViaTwilio({
      accountSid: args.accountSid,
      authToken: args.authToken,
      from: args.from,
      to: args.to,
      contentSid: args.contentSid,
      contentVariables: {},
    });
  },
});
