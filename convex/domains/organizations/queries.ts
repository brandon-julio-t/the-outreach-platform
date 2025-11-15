import { query } from "../../_generated/server";
import { getAuthUserWithOrgId } from "../core/getAuthUserWithOrgId";

export const getCurrentUserActiveOrganization = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUserWithOrgId({ ctx });
    if (!user) {
      return null;
    }

    const organizationMembers = await ctx.db
      .query("organizationMembers")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const isUserInOrganization = organizationMembers.some(
      (member) => member.organizationId === user.organizationId,
    );

    if (!isUserInOrganization) {
      return null;
    }

    return await ctx.db.get(user.organizationId);
  },
});

export const getCurrentUserOrganizations = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUserWithOrgId({ ctx });
    if (!user) {
      return null;
    }

    const organizationMembers = await ctx.db
      .query("organizationMembers")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const organizations = await Promise.all(
      organizationMembers.map(async (member) => {
        return await ctx.db.get(member.organizationId);
      }),
    ).then((organizations) => organizations.filter((org) => org !== null));

    return organizations;
  },
});
