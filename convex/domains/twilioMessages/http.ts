import { HttpRouter } from "convex/server";
import z from "zod";
import { workflow } from "../..";
import { internal } from "../../_generated/api";
import { httpAction } from "../../_generated/server";

export function twilioMessagesHttpRoutes(http: HttpRouter) {
  http.route({
    path: "/webhooks/twilio/message-status",
    method: "POST",
    handler: httpAction(async (ctx, req) => {
      const rawText = await req.text();

      console.log("rawText", rawText);

      /**
       * Example
       * ```json
       * {
       *   "ApiVersion": "2010-04-01",
       *   "MessageStatus": "delivered",
       *   "RawDlrDoneDate": "2511160837",
       *   "SmsSid": "MM6e5383d5703e0780347e3f4ffc33cae7",
       *   "SmsStatus": "delivered",
       *   "To": "+18777804236",
       *   "From": "+14752601888",
       *   "MessageSid": "MM6e5383d5703e0780347e3f4ffc33cae7",
       *   "AccountSid": "ACf39b56dca717cf6383248139123328cd"
       * }
       * ```
       */
      const body = new URLSearchParams(rawText);

      console.log("body", body);

      const { success, data, error } = z
        .object({
          messageSid: z.string().nonempty(),
          accountSid: z.string().nonempty(),
          messageStatus: z.string().nonempty(),
          errorCode: z.string().nullish(),
          errorMessage: z.string().nullish(),
        })
        .safeParse({
          messageSid: body.get("MessageSid"),
          accountSid: body.get("AccountSid"),
          messageStatus: body.get("MessageStatus"),
          errorCode: body.get("ErrorCode"),
          errorMessage: body.get("ErrorMessage"),
        });

      if (!success) {
        console.error("Invalid request body", { error });
        return Response.json({ error: error.message }, { status: 400 });
      }

      await ctx.scheduler.runAfter(
        0,
        internal.domains.twilioMessages.internalMutations
          .updateTwilioMessageStatusFromWebhook,
        {
          accountSid: data.accountSid,
          messageSid: data.messageSid,
          messageStatus: data.messageStatus,
          errorCode: data.errorCode ?? undefined,
          errorMessage: data.errorMessage ?? undefined,
        },
      );

      return Response.json(
        { message: "Message status updated" },
        { status: 200 },
      );
    }),
  });

  http.route({
    path: "/webhooks/twilio/incoming-message",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
      const rawText = await request.text();

      console.log("rawText", rawText);

      /**
       * Example
       * ```json
       * {
       *   "SmsMessageSid": "SM883c02ac58c6d09512260a440dad47c0",
       *   "NumMedia": "0",
       *   "ProfileName": "Brandon Julio Thenaro",
       *   "MessageType": "text",
       *   "SmsSid": "SM883c02ac58c6d09512260a440dad47c0",
       *   "WaId": "6285155228431",
       *   "SmsStatus": "received",
       *   "Body": "yume no tobira",
       *   "To": "whatsapp:+14155238886",
       *   "NumSegments": "1",
       *   "ReferralNumMedia": "0",
       *   "MessageSid": "SM883c02ac58c6d09512260a440dad47c0",
       *   "AccountSid": "ACf39b56dca717cf6383248139123328cd",
       *   "ChannelMetadata": "{\"type\":\"whatsapp\",\"data\":{\"context\":{\"ProfileName\":\"Brandon Julio Thenaro\",\"WaId\":\"6285155228431\"}}}",
       *   "From": "whatsapp:+6285155228431",
       *   "ApiVersion": "2010-04-01"
       * }
       * ```
       */
      const body = new URLSearchParams(rawText);

      console.log("body", body);

      const { success, data, error } = z
        .object({
          from: z.string().nonempty(),
          to: z.string().nonempty(),
          messageText: z.string().nonempty(),
          profileName: z.string().nonempty(),
          accountSid: z.string().nonempty(),
          messageSid: z.string().nonempty(),
          apiVersion: z.string().nonempty(),
        })
        .safeParse({
          from: body.get("From"),
          to: body.get("To"),
          messageText: body.get("Body"),
          profileName: body.get("ProfileName") ?? body.get("From"),
          accountSid: body.get("AccountSid"),
          messageSid: body.get("MessageSid"),
          apiVersion: body.get("ApiVersion"),
        });

      if (!success) {
        console.error("Invalid request body", { error });
        return Response.json({ error: error.message }, { status: 400 });
      }

      const workflowId = await workflow.start(
        ctx,
        internal.domains.twilioMessages.workflows
          .handleIncomingWhatsAppMessageWorkflow,
        {
          accountSid: data.accountSid,
          from: data.from,
          to: data.to,
          messageSid: data.messageSid,
          apiVersion: data.apiVersion,
          messageText: data.messageText,
          profileName: data.profileName,
        },
      );

      console.log("workflowId", workflowId);

      return Response.json({ message: "Message received" }, { status: 200 });
    }),
  });
}
