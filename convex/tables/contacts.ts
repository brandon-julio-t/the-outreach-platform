import { defineTable } from "convex/server";
import { v } from "convex/values";

export const contacts = defineTable({
  organizationId: v.id("organizations"),
  name: v.string(),
  phone: v.string(),

  latestMessageTime: v.optional(v.number()),
  lastUserReplyTime: v.optional(v.number()),
  lastUpdateTime: v.optional(v.number()),

  goalsAchievedNote: v.optional(v.string()),
  goalsAchievedTime: v.optional(v.number()),

  aiAssistantDisabledTime: v.optional(v.nullable(v.number())),
  aiAssistantDisabledReason: v.optional(v.string()),
})
  .index("by_organizationId", ["organizationId"])
  .index("by_organizationId_phone", ["organizationId", "phone"])
  .index("by_organizationId_latestMessageTime", [
    "organizationId",
    "latestMessageTime",
  ])
  .searchIndex("search_name", {
    searchField: "name",
    filterFields: ["organizationId"],
  })
  .searchIndex("search_phone", {
    searchField: "phone",
    filterFields: ["organizationId"],
  });
