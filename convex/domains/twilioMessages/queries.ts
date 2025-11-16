import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { workflow } from "../..";
import { query } from "../../_generated/server";
import { ensureUserWithOrgId } from "../core/ensureUserWithOrgId";

export const getTwilioMessages = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const user = await ensureUserWithOrgId({ ctx });

    const paginated = await ctx.db
      .query("twilioMessages")
      .withIndex("by_organizationId", (q) =>
        q.eq("organizationId", user.organizationId),
      )
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...paginated,
      page: await Promise.all(
        paginated.page.map(async (message) => {
          return {
            ...message,

            contact: message.contactId
              ? await ctx.db.get(message.contactId)
              : null,

            workflowStatus: message.workflowId
              ? await workflow.status(ctx, message.workflowId)
              : null,
          };
        }),
      ),
    };
  },
});

export const getTwilioMessagesByBroadcastId = query({
  args: {
    twilioMessageBroadcastId: v.id("twilioMessageBroadcasts"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const user = await ensureUserWithOrgId({ ctx });

    const paginated = await ctx.db
      .query("twilioMessages")
      .withIndex("by_organizationId_twilioMessageBroadcastId", (q) =>
        q
          .eq("organizationId", user.organizationId)
          .eq("twilioMessageBroadcastId", args.twilioMessageBroadcastId),
      )
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...paginated,
      page: await Promise.all(
        paginated.page.map(async (message) => {
          return {
            ...message,

            contact: message.contactId
              ? await ctx.db.get(message.contactId)
              : null,

            workflowStatus: message.workflowId
              ? await workflow.status(ctx, message.workflowId)
              : null,
          };
        }),
      ),
    };
  },
});
