import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { httpAction } from "./_generated/server";

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
  path: "/webhooks/twilio/message-status",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const body = await req.text();

    console.log("body", body);

    return new Response("", { status: 200 });
  }),
});

export default http;
