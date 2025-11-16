import { paginationOptsValidator, PaginationResult } from "convex/server";
import { Doc } from "../../_generated/dataModel";
import { query } from "../../_generated/server";
import { getAuthUserWithOrgId } from "../core/getAuthUserWithOrgId";

export const getTwilioMessageBroadcasts = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const user = await getAuthUserWithOrgId({ ctx });
    if (!user) {
      return {
        page: [],
        isDone: true,
        continueCursor: "",
      } satisfies PaginationResult<Doc<"twilioMessageBroadcasts">>;
    }

    const paginated = await ctx.db
      .query("twilioMessageBroadcasts")
      .withIndex("by_organizationId", (q) =>
        q.eq("organizationId", user.organizationId),
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
