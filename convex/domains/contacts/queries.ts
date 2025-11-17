import { paginationOptsValidator, PaginationResult } from "convex/server";
import { v } from "convex/values";
import { Doc } from "../../_generated/dataModel";
import { query } from "../../_generated/server";
import { getAuthUserWithOrgId } from "../core/getAuthUserWithOrgId";

export const getContacts = query({
  args: {
    search: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const user = await getAuthUserWithOrgId({ ctx });
    if (!user) {
      return {
        page: [],
        isDone: true,
        continueCursor: "",
      } satisfies PaginationResult<Doc<"contacts">>;
    }

    const search = args.search ?? "";
    if (search) {
      const byName = await ctx.db
        .query("contacts")
        .withSearchIndex("search_name", (q) => q.search("name", search))
        .take(10);

      const byPhone = await ctx.db
        .query("contacts")
        .withSearchIndex("search_phone", (q) => q.search("phone", search))
        .take(10);

      return {
        page: [...byName, ...byPhone],
        isDone: false,
        continueCursor: "",
      } satisfies PaginationResult<Doc<"contacts">>;
    }

    return await ctx.db
      .query("contacts")
      .withIndex("by_organizationId", (q) =>
        q.eq("organizationId", user.organizationId),
      )
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getContactById = query({
  args: {
    id: v.id("contacts"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUserWithOrgId({ ctx });
    if (!user) {
      return null;
    }

    const contact = await ctx.db.get(args.id);
    if (!contact) {
      return null;
    }

    if (contact.organizationId !== user.organizationId) {
      return null;
    }

    return contact;
  },
});
