import { BaseTwilioFunctionArgs } from "./types";

/**
 * @see https://console.twilio.com/us1/develop/sms/virtual-phone
 * @see https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
 */
export async function sendWhatsAppMessageViaTwilio(
  args: BaseTwilioFunctionArgs & {
    from: string;
    to: string;
    contentSid: string;
    contentVariables: Record<string, string>;
  },
) {
  console.log("args", args);

  const isVirtualPhone = args.to === "+18777804236";

  const body = {
    To: isVirtualPhone ? args.to : "whatsapp:" + args.to,
    From: isVirtualPhone ? args.from : "whatsapp:" + args.from,
    ContentSid: args.contentSid,
    ContentVariables: JSON.stringify(args.contentVariables),
    statusCallback: `${process.env.OVERRIDE_CONVEX_SITE_URL ?? process.env.CONVEX_SITE_URL}/webhooks/twilio/message-status`,
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

  const json = await response.json();

  console.log("json", json);

  return json;
}
