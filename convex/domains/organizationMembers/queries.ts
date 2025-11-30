import { getAuthUserId } from "@convex-dev/auth/server";
import type { PaginationResult } from "convex/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import type { Doc } from "../../_generated/dataModel";
import { query } from "../../_generated/server";

export const getOrganizationMembers = query({
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
      } satisfies PaginationResult<Doc<"organizationMembers">>;
    }

    const paginated = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organizationId", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...paginated,
      page: await Promise.all(
        paginated.page.map(async (member) => {
          return {
            ...member,
            user: await ctx.db.get(member.userId),
          };
        }),
      ),
    };
  },
});
