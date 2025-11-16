import { paginationOptsValidator, PaginationResult } from "convex/server";
import { Doc } from "../../_generated/dataModel";
import { query } from "../../_generated/server";
import { getAuthUserWithOrgId } from "../core/getAuthUserWithOrgId";

export const getTwilioMessageTemplates = query({
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
      } satisfies PaginationResult<Doc<"twilioMessageTemplates">>;
    }

    return await ctx.db
      .query("twilioMessageTemplates")
      .withIndex("by_organizationId", (q) =>
        q.eq("organizationId", user.organizationId),
      )
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
