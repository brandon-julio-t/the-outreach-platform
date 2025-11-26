import { defineTable } from "convex/server";
import { v } from "convex/values";

export const twilioMessageBroadcasts = defineTable({
  organizationId: v.id("organizations"),
  userId: v.id("users"),
  twilioMessageTemplateId: v.id("twilioMessageTemplates"),
  contentSid: v.string(),
  contentVariables: v.record(v.string(), v.string()),
}).index("by_organizationId", ["organizationId"]);
