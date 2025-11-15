import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "../../_generated/server";

export const getCurrentUserActiveOrganization = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const user = await ctx.db.get(userId);
    if (!user?.organizationId) {
      return null;
    }

    return await ctx.db.get(user.organizationId);
  },
});

export const getCurrentUserOrganizations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const organizationMembers = await ctx.db
      .query("organizationMembers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const organizations = await Promise.all(
      organizationMembers.map(async (member) => {
        return await ctx.db.get(member.organizationId);
      }),
    ).then((organizations) => organizations.filter((org) => org !== null));

    return organizations;
  },
});
