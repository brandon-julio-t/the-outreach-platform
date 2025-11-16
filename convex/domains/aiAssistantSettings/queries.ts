import { query } from "../../_generated/server";
import { getAuthUserWithOrgId } from "../core/getAuthUserWithOrgId";

export const getActiveOrgAiAssistantSettings = query({
  args: {
    //
  },
  handler: async (ctx) => {
    const user = await getAuthUserWithOrgId({ ctx });
    if (!user) {
      return null;
    }

    return await ctx.db
      .query("aiAssistantSettings")
      .withIndex("by_organizationId", (q) =>
        q.eq("organizationId", user.organizationId),
      )
      .first();
  },
});
