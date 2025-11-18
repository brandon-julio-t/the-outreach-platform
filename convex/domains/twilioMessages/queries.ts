import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator, PaginationResult } from "convex/server";
import { v } from "convex/values";
import { workflow } from "../..";
import { Doc } from "../../_generated/dataModel";
import { query } from "../../_generated/server";

export const getTwilioMessages = query({
  args: {
    organizationId: v.id("organizations"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        page: [],
        isDone: true,
        continueCursor: "",
      } satisfies PaginationResult<Doc<"twilioMessages">>;
    }

    const paginated = await ctx.db
      .query("twilioMessages")
      .withIndex("by_organizationId", (q) =>
        q.eq("organizationId", args.organizationId),
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
    organizationId: v.id("organizations"),
    twilioMessageBroadcastId: v.id("twilioMessageBroadcasts"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        page: [],
        isDone: true,
        continueCursor: "",
      } satisfies PaginationResult<Doc<"twilioMessages">>;
    }

    const paginated = await ctx.db
      .query("twilioMessages")
      .withIndex("by_organizationId_twilioMessageBroadcastId", (q) =>
        q
          .eq("organizationId", args.organizationId)
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

export const getTwilioMessagesByContactId = query({
  args: {
    organizationId: v.id("organizations"),
    contactId: v.id("contacts"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        page: [],
        isDone: true,
        continueCursor: "",
      } satisfies PaginationResult<Doc<"twilioMessages">>;
    }

    const paginated = await ctx.db
      .query("twilioMessages")
      .withIndex("by_organizationId_contactId", (q) =>
        q
          .eq("organizationId", args.organizationId)
          .eq("contactId", args.contactId),
      )
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...paginated,
      page: await Promise.all(
        paginated.page.map(async (message) => {
          return {
            ...message,

            //
          };
        }),
      ),
    };
  },
});
