import { defineTable } from "convex/server";
import { v } from "convex/values";

export const aiAssistantSettings = defineTable({
  organizationId: v.id("organizations"),
  modelId: v.union(v.literal("gpt-5.1")),
  systemPrompt: v.string(),
}).index("by_organizationId", ["organizationId"]);
