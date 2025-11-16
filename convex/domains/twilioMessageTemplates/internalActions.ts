import { v } from "convex/values";
import { internalAction } from "../../_generated/server";

/**
 * @docs https://www.twilio.com/docs/content/twiliocard#data-parameters
 * @docs https://www.twilio.com/docs/content/twiliocard#code-example
 *
 * ```curl
 * curl -X POST 'https://content.twilio.com/v1/Content' \
 * -H 'Content-Type: application/json' \
 * -u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN \
 * -d '{
 *     "friendly_name": "owl_air_card",
 *     "language": "en",
 *     "variables": {
 *         "1": "coupon_code"
 *     },
 *     "types": {
 *         "twilio/card": {
 *                     "title": "Congratulations, you'\''ve reached Elite status! Add code {{1}} for 10% off.",
 *                     "subtitle": "To unsubscribe, reply Stop",
 *                     "actions": [
 *                         {
 *                             "url": "https://owlair.com/",
 *                             "title": "Order Online",
 *                             "type": "URL"
 *                         },
 *                         {
 *                             "phone": "+15551234567",
 *                             "title": "Call Us",
 *                             "type": "PHONE_NUMBER"
 *                         }
 *                     ]
 *                 },
 *         "twilio/text": {
 *             "body": "Congratulations, your account reached Elite status, you are now eligible for 10% off any flight! Just add coupon code {{1}} to check out."
 *         }
 *     }
 * }'
 * ```
 */
export const createTwilioCardMessageTemplateAction = internalAction({
  args: {
    accountSid: v.string(),
    authToken: v.string(),
    name: v.string(),
    language: v.string(),
    variables: v.record(v.string(), v.string()),
    cardData: v.object({
      body: v.string(),
      media: v.optional(v.string()),
      actions: v.array(
        v.union(
          v.object({
            type: v.literal("QUICK_REPLY"),
            title: v.string(),
            id: v.string(),
          }),
          v.object({
            type: v.literal("URL"),
            title: v.string(),
            url: v.string(),
          }),
          v.object({
            type: v.literal("PHONE_NUMBER"),
            title: v.string(),
            phone: v.string(),
          }),
          v.object({
            type: v.literal("COPY_CODE"),
            title: v.string(),
            code: v.string(),
          }),
        ),
      ),
    }),
  },
  handler: async (_ctx, args) => {
    console.log("args", args);

    const response = await fetch(`https://content.twilio.com/v1/Content`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${args.accountSid}:${args.authToken}`)}`,
      },
      body: JSON.stringify({
        friendly_name: args.name,
        language: args.language,
        variables: args.variables,
        types: {
          "twilio/card": {
            title: args.cardData.body,
            media: args.cardData.media ? [args.cardData.media] : undefined,
            actions: args.cardData.actions,
          },
          "twilio/text": {
            body: args.cardData.body,
          },
        },
      }),
    });

    console.log("response", response);

    const json = (await response.json()) as { sid?: string };

    console.log("json", json);

    return {
      ok: response.ok,
      json,
    };
  },
});

/**
 * @docs https://www.twilio.com/docs/content/create-and-send-your-first-content-api-template#submit-a-content-template-for-whatsapp-approval-optional
 *
 *
 * ```curl
 * curl -X POST 'https://content.twilio.com/v1/Content/HXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/ApprovalRequests/whatsapp' \
 * -H 'Content-Type: application/json' \
 * -u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN \
 * -d '{
 *   "name": "flight_replies",
 *   "category": "UTILITY"
 * }'
 * ```
 */
export const submitWhatsAppApprovalRequestAction = internalAction({
  args: {
    accountSid: v.string(),
    authToken: v.string(),
    twilioContentSid: v.string(),
    name: v.string(),
    messageCategory: v.union(v.literal("marketing"), v.literal("utility")),
  },
  handler: async (_ctx, args) => {
    console.log("args", args);

    const response = await fetch(
      `https://content.twilio.com/v1/Content/${args.twilioContentSid}/ApprovalRequests/whatsapp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${btoa(`${args.accountSid}:${args.authToken}`)}`,
        },
        body: JSON.stringify({
          name: args.name,
          category: args.messageCategory,
        }),
      },
    );

    console.log("response", response);

    const json = (await response.json()) as {
      status?: "pending" | "received" | "approved" | "rejected";
    };

    console.log("json", json);

    return {
      ok: response.ok,
      json,
    };
  },
});

/**
 * @docs https://www.twilio.com/docs/content/create-and-send-your-first-content-api-template#fetch-an-approval-status-optional
 * Fetching an approval status returns the current state of the WhatsApp template approval submission. The following statuses are possible:
 *
 * - Received: The request has successfully been submitted to Twilio. Generally Twilio submits these immediately to WhatsApp.
 * - Pending: WhatsApp has received the submission and is processing the request.
 * - Approved: WhatsApp has approved the template and it's now available for use.
 * - Rejected: WhatsApp has rejected the request. You can find the rejection reason in the rejection_reason field. Learn more about the approval process and best practices.
 *
 * ```curl
 * curl -X GET 'https://content.twilio.com/v1/Content/HXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/ApprovalRequests' \
 * -H 'Content-Type: application/json' \
 * -u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN
 * ```
 *
 * Output
 * ```json
 * {
 *     "url": "https://content.twilio.com/v1/Content/HXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/ApprovalRequests",
 *     "whatsapp": {
 *         "category": "TRANSPORTATION_UPDATE",
 *         "status": "pending",
 *         "name": "flight_replies",
 *         "type": "whatsapp",
 *         "content_type": "twilio/quick-reply",
 *         "rejection_reason": ""
 *     },
 *     "account_sid": "ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
 *     "sid": "HXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
 * }
 * ```
 */
export const fetchWhatsAppApprovalStatusAction = internalAction({
  args: {
    accountSid: v.string(),
    authToken: v.string(),
    twilioContentSid: v.string(),
  },
  handler: async (_ctx, args) => {
    console.log("args", args);

    const response = await fetch(
      `https://content.twilio.com/v1/Content/${args.twilioContentSid}/ApprovalRequests`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${btoa(`${args.accountSid}:${args.authToken}`)}`,
        },
      },
    );

    console.log("response", response);

    const json = (await response.json()) as {
      whatsapp?: {
        status?: "pending" | "received" | "approved" | "rejected";
        rejection_reason?: string;
      };
    };

    console.log("json", json);

    return {
      ok: response.ok,
      json,
    };
  },
});
