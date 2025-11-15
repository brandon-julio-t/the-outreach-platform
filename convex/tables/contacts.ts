import { defineTable } from "convex/server";
import { v } from "convex/values";

export const contacts = defineTable({
  organizationId: v.id("organizations"),
  name: v.string(),
  phone: v.string(),
})
  .index("by_organizationId", ["organizationId"])
  .searchIndex("search_name", {
    searchField: "name",
    filterFields: ["organizationId"],
  })
  .searchIndex("search_phone", {
    searchField: "phone",
    filterFields: ["organizationId"],
  });
