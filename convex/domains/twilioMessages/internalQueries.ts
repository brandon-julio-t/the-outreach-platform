import { v } from "convex/values";
import { internalQuery } from "../../_generated/server";

export const getContactPastMessagesForAiAssistant = internalQuery({
  args: {
    organizationId: v.id("organizations"),
    contactId: v.id("contacts"),
  },
  handler: async (ctx, args) => {
    const latestMessages = await ctx.db
      .query("twilioMessages")
      .withIndex("by_organizationId_contactId", (q) =>
        q
          .eq("organizationId", args.organizationId)
          .eq("contactId", args.contactId),
      )
      .order("desc")
      .take(100);

    // AI needs to see the messages in chronological order, so we need to reverse the array
    latestMessages.reverse();

    return latestMessages;
  },
});
