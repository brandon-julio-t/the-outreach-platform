import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator, PaginationResult } from "convex/server";
import { v } from "convex/values";
import { Doc } from "../../_generated/dataModel";
import { query } from "../../_generated/server";

export const getContacts = query({
  args: {
    search: v.optional(v.string()),
    organizationId: v.id("organizations"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
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
        .withSearchIndex("search_name", (q) =>
          q.search("name", search).eq("organizationId", args.organizationId),
        )
        .take(10);

      const byPhone = await ctx.db
        .query("contacts")
        .withSearchIndex("search_phone", (q) =>
          q.search("phone", search).eq("organizationId", args.organizationId),
        )
        .take(10);

      const addedIds = new Set<string>();

      const uniqueContacts: Doc<"contacts">[] = [];

      [...byName, ...byPhone].forEach((contact) => {
        if (!addedIds.has(contact._id)) {
          addedIds.add(contact._id);
          uniqueContacts.push(contact);
        }
      });

      return {
        page: uniqueContacts,
        isDone: true,
        continueCursor: "",
      } satisfies PaginationResult<Doc<"contacts">>;
    }

    return await ctx.db
      .query("contacts")
      .withIndex("by_organizationId", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getContactsForChatPage = query({
  args: {
    search: v.optional(v.string()),
    organizationId: v.id("organizations"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
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
        .withSearchIndex("search_name", (q) =>
          q.search("name", search).eq("organizationId", args.organizationId),
        )
        .take(10);

      const byPhone = await ctx.db
        .query("contacts")
        .withSearchIndex("search_phone", (q) =>
          q.search("phone", search).eq("organizationId", args.organizationId),
        )
        .take(10);

      const addedIds = new Set<string>();

      const uniqueContacts: Doc<"contacts">[] = [];

      [...byName, ...byPhone].forEach((contact) => {
        if (!addedIds.has(contact._id)) {
          addedIds.add(contact._id);
          uniqueContacts.push(contact);
        }
      });

      return {
        page: uniqueContacts,
        isDone: true,
        continueCursor: "",
      } satisfies PaginationResult<Doc<"contacts">>;
    }

    return await ctx.db
      .query("contacts")
      .withIndex("by_organizationId_latestMessageTime", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getContactById = query({
  args: {
    id: v.id("contacts"),
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const contact = await ctx.db.get(args.id);
    if (!contact) {
      return null;
    }

    if (contact.organizationId !== args.organizationId) {
      return null;
    }

    return contact;
  },
});
