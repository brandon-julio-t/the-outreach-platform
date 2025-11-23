import { getAuthSessionId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation } from "../../_generated/server";

export const setCurrentUserActiveOrganization = mutation({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const sessionId = await getAuthSessionId(ctx);
    if (!sessionId) {
      throw new ConvexError("Session not authenticated");
    }

    await ctx.db.patch(sessionId, {
      organizationId: args.organizationId,
    });
  },
});
