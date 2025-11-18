import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator, PaginationResult } from "convex/server";
import { v } from "convex/values";
import { Doc } from "../../_generated/dataModel";
import { query } from "../../_generated/server";

export const getTwilioMessageTemplates = query({
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
      } satisfies PaginationResult<Doc<"twilioMessageTemplates">>;
    }

    return await ctx.db
      .query("twilioMessageTemplates")
      .withIndex("by_organizationId", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
