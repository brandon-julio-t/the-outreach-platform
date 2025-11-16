import { v } from "convex/values";
import { internalAction } from "../../_generated/server";
import { SendWhatsAppMessageViaTwilioResponse } from "../core/twilio/types";

export const sendWhatsAppMessageViaTwilioAction = internalAction({
  args: {
    accountSid: v.string(),
    authToken: v.string(),
    from: v.string(),
    to: v.string(),
    contentSid: v.string(),
    contentVariables: v.record(v.string(), v.string()),
  },
  handler: async (_ctx, args) => {
    console.log("args", args);

    const isVirtualPhone = args.to === "+18777804236";

    const body = {
      To: isVirtualPhone ? args.to : "whatsapp:" + args.to,
      From: isVirtualPhone ? args.from : "whatsapp:" + args.from,
      ...(isVirtualPhone
        ? {
            Body: args.contentSid,
          }
        : {
            ContentSid: args.contentSid,
            ContentVariables: JSON.stringify(args.contentVariables),
          }),

      StatusCallback: `${process.env.OVERRIDE_CONVEX_SITE_URL ?? process.env.CONVEX_SITE_URL}/webhooks/twilio/message-status`,
    };

    console.log("body", body);

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${args.accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`${args.accountSid}:${args.authToken}`)}`,
        },
        body: new URLSearchParams(body),
      },
    );

    console.log("response", response);

    const json =
      (await response.json()) as SendWhatsAppMessageViaTwilioResponse;

    console.log("json", json);

    return json as SendWhatsAppMessageViaTwilioResponse;
  },
});
