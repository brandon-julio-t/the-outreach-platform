import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation } from "../../_generated/server";

export const setCurrentUserActiveOrganization = mutation({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("User not authenticated");
    }

    await ctx.db.patch(userId, {
      organizationId: args.organizationId,
    });
  },
});
