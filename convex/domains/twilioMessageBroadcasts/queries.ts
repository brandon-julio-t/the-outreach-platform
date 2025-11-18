import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { query } from "../../_generated/server";

export const getTwilioMessageBroadcasts = query({
  args: {
    organizationId: v.id("organizations"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const paginated = await ctx.db
      .query("twilioMessageBroadcasts")
      .withIndex("by_organizationId", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...paginated,
      page: await Promise.all(
        paginated.page.map(async (broadcast) => {
          return {
            ...broadcast,

            twilioMessageTemplate: await ctx.db.get(
              broadcast.twilioMessageTemplateId,
            ),
          };
        }),
      ),
    };
  },
});
