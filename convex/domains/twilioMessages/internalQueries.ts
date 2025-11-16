import { v } from "convex/values";
import { internalQuery } from "../../_generated/server";

export const getContactPastMessagesForAiAssistant = internalQuery({
  args: {
    organizationId: v.id("organizations"),
    contactId: v.id("contacts"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("twilioMessages")
      .withIndex("by_organizationId_contactId", (q) =>
        q
          .eq("organizationId", args.organizationId)
          .eq("contactId", args.contactId),
      )
      .order("desc")
      .take(100);
  },
});
