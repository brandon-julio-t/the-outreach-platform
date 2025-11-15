import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const setCurrentUserActiveOrganization = mutation({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    await ctx.db.patch(userId, {
      organizationId: args.organizationId,
    });
  },
});
