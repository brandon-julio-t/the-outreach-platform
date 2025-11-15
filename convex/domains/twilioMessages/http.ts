import { HttpRouter } from "convex/server";
import { internal } from "../../_generated/api";
import { httpAction } from "../../_generated/server";

export function twilioMessagesHttpRoutes(http: HttpRouter) {
  http.route({
    path: "/webhooks/twilio/message-status",
    method: "POST",
    handler: httpAction(async (ctx, req) => {
      const rawText = await req.text();

      console.log("rawText", rawText);

      const body = new URLSearchParams(rawText);

      console.log("body", body);

      const messageSid = body.get("MessageSid");
      const accountSid = body.get("AccountSid");
      const messageStatus = body.get("MessageStatus");
      const errorCode = body.get("ErrorCode");
      const errorMessage = body.get("ErrorMessage");

      console.log("messageSid", messageSid);
      console.log("accountSid", accountSid);
      console.log("messageStatus", messageStatus);
      console.log("errorCode", errorCode);
      console.log("errorMessage", errorMessage);

      if (!messageSid) {
        return Response.json(
          { error: "MessageSid is required" },
          { status: 400 },
        );
      }
      if (!accountSid) {
        return Response.json(
          { error: "AccountSid is required" },
          { status: 400 },
        );
      }
      if (!messageStatus) {
        return Response.json(
          { error: "MessageStatus is required" },
          { status: 400 },
        );
      }

      await ctx.scheduler.runAfter(
        0,
        internal.domains.twilioMessages.internalMutations
          .updateTwilioMessageStatusFromWebhook,
        {
          accountSid: accountSid,
          messageSid: messageSid,
          messageStatus: messageStatus,
          errorCode: errorCode ?? undefined,
          errorMessage: errorMessage ?? undefined,
        },
      );

      return Response.json(
        { message: "Message status updated" },
        { status: 200 },
      );
    }),
  });

  http.route({
    path: "/twilio/incoming-message",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
      const rawText = await request.text();

      console.log("rawText", rawText);

      const body = new URLSearchParams(rawText);

      console.log("body", body);

      //   await retrier.run(
      //     ctx,
      //     internal.domains.agent.internalNodeActions.handleIncomingMessage,
      //     {
      //       from: requestValues.get("From") ?? "",
      //       body: requestValues.get("Body") ?? "",
      //       whatsappDisplayName: requestValues.get("ProfileName") ?? "",
      //     },
      //   );

      return Response.json({ message: "Message received" }, { status: 200 });
    }),
  });
}
