import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { query } from "../../_generated/server";

export const getOrganizationMembers = query({
  args: {
    organizationId: v.id("organizations"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
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
