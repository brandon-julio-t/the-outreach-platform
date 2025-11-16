import { v } from "convex/values";
import { internalQuery } from "../../_generated/server";

export const getContactByPhone = internalQuery({
  args: {
    phone: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("args", args);

    return await ctx.db
      .query("contacts")
      .withSearchIndex("search_phone", (q) => q.search("phone", args.phone))
      .first();
  },
});
