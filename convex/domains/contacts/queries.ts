import { getAuthUserId } from "@convex-dev/auth/server";
import type { PaginationResult } from "convex/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import type { Doc } from "../../_generated/dataModel";
import { query } from "../../_generated/server";
import { contactFilterTypes } from "./configs";

export const getContacts = query({
  args: {
    search: v.optional(v.string()),
    filterType: v.optional(
      v.union(...contactFilterTypes.map((type) => v.literal(type))),
    ),
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

    const filterType = args.filterType ?? "all";

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

      const filteredContacts = uniqueContacts.filter((contact) => {
        switch (filterType) {
          case "in_progress":
            return (contact.goalsAchievedTime ?? 0) <= 0;
          case "goals_achieved":
            return (contact.goalsAchievedTime ?? 0) > 0;
          case "ai_assistant_disabled":
            return (contact.aiAssistantDisabledTime ?? 0) > 0;
          default:
            return true;
        }
      });

      return {
        page: filteredContacts,
        isDone: true,
        continueCursor: "",
      } satisfies PaginationResult<Doc<"contacts">>;
    }

    switch (filterType) {
      case "in_progress":
        return await ctx.db
          .query("contacts")
          .withIndex("by_organizationId_goalsAchievedTime", (q) =>
            q
              .eq("organizationId", args.organizationId)
              .eq("goalsAchievedTime", undefined),
          )
          .order("desc")
          .paginate(args.paginationOpts);

      case "goals_achieved":
        return await ctx.db
          .query("contacts")
          .withIndex("by_organizationId_goalsAchievedTime", (q) =>
            q
              .eq("organizationId", args.organizationId)
              .gt("goalsAchievedTime", 0),
          )
          .order("desc")
          .paginate(args.paginationOpts);

      case "ai_assistant_disabled":
        return await ctx.db
          .query("contacts")
          .withIndex("by_organizationId_aiAssistantDisabledTime", (q) =>
            q
              .eq("organizationId", args.organizationId)
              .gt("aiAssistantDisabledTime", 0),
          )
          .order("desc")
          .paginate(args.paginationOpts);

      default:
        return await ctx.db
          .query("contacts")
          .withIndex("by_organizationId_latestMessageTime", (q) =>
            q.eq("organizationId", args.organizationId),
          )
          .order("desc")
          .paginate(args.paginationOpts);
    }
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
