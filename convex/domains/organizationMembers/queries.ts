import { paginationOptsValidator, PaginationResult } from "convex/server";
import { Doc } from "../../_generated/dataModel";
import { query } from "../../_generated/server";
import { getAuthUserWithOrgId } from "../core/getAuthUserWithOrgId";

export const getOrganizationMembers = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const data = await getAuthUserWithOrgId({ ctx });

    if (!data) {
      return {
        page: [],
        isDone: true,
        continueCursor: "",
      } satisfies PaginationResult<Doc<"organizationMembers">>;
    }

    const paginated = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organizationId", (q) =>
        q.eq("organizationId", data.organizationId),
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
