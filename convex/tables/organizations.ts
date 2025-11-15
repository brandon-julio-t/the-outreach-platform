import { defineTable } from "convex/server";
import { v } from "convex/values";

export const organizations = defineTable({
  name: v.string(),
});

export const organizationMembers = defineTable({
  organizationId: v.id("organizations"),
  userId: v.id("users"),
}).index("by_userId", ["userId"]);
