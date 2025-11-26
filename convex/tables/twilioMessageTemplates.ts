import { vWorkflowId } from "@convex-dev/workflow";
import { defineTable } from "convex/server";
import { v } from "convex/values";

export const twilioMessageTemplates = defineTable({
  organizationId: v.id("organizations"),
  name: v.string(),
  messageLanguage: v.string(),
  messageTemplate: v.string(),
  messageVariables: v.record(v.string(), v.string()),
  messageMedia: v.optional(v.string()),
  messageMediaFileKey: v.optional(v.string()),
  messageCategory: v.union(v.literal("marketing"), v.literal("utility")),
  lastUpdatedAt: v.optional(v.number()),

  twilioContentSid: v.optional(v.string()),
  twilioStatus: v.optional(v.union(v.literal("success"), v.literal("error"))),
  twilioResponseJson: v.optional(v.any()),

  whatsAppApprovalStatus: v.optional(
    v.union(
      v.literal("pending"),
      v.literal("received"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("error"),
    ),
  ),
  whatsAppApprovalResponseJson: v.optional(v.any()),

  workflowId: v.optional(vWorkflowId),
}).index("by_organizationId", ["organizationId"]);
