import { httpRouter } from "convex/server";
import z from "zod";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";
import { twilioMessagesHttpRoutes } from "./domains/twilioMessages/http";
import { r2 } from "./r2";

const http = httpRouter();

auth.addHttpRoutes(http);

twilioMessagesHttpRoutes(http);

const inputSchema = z.object({
  fileKey: z.string().nonempty(),
});

http.route({
  path: "/images",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    console.log("req", req);

    const url = new URL(req.url);
    const searchParams = url.searchParams;
    console.log("searchParams", searchParams);

    const json = { fileKey: searchParams.get("fileKey") };
    console.log("json", json);

    const { success, data, error } = inputSchema.safeParse(json);
    if (!success) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    const { fileKey } = data;

    const imageUrl = await r2.getUrl(fileKey);
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return Response.json({ error: "Failed to fetch image" }, { status: 500 });
    }

    const metadata = await r2.getMetadata(ctx, fileKey);

    return new Response(imageResponse.body, {
      headers: {
        "Content-Type": metadata?.contentType || "application/octet-stream",
      },
    });
  }),
});

export default http;
