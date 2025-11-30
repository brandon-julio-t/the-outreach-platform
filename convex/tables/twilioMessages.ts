import { vWorkflowId } from "@convex-dev/workflow";
import { defineTable } from "convex/server";
import { v } from "convex/values";

export const twilioMessages = defineTable({
  organizationId: v.id("organizations"),
  displayName: v.string(),
  role: v.union(v.literal("user"), v.literal("assistant")),
  userId: v.optional(v.id("users")),
  contactId: v.optional(v.id("contacts")),
  twilioMessageBroadcastId: v.optional(v.id("twilioMessageBroadcasts")),
  twilioMessageTemplateId: v.optional(v.id("twilioMessageTemplates")),

  from: v.string(),
  to: v.string(),
  body: v.string(),
  messageSid: v.string(),
  accountSid: v.string(),
  apiVersion: v.string(),
  direction: v.string(),
  errorCode: v.optional(v.string()),
  errorMessage: v.optional(v.string()),
  status: v.union(
    v.literal("queued"),
    v.literal("sending"),
    v.literal("sent"),
    v.literal("failed"),
    v.literal("delivered"),
    v.literal("undelivered"),
    v.literal("receiving"),
    v.literal("received"),
    v.literal("accepted"),
    v.literal("scheduled"),
    v.literal("read"),
    v.literal("partially_delivered"),
    v.literal("canceled"),
  ),

  lastUpdatedAt: v.optional(v.number()),
  rawResponseJson: v.optional(v.any()),
  workflowId: v.optional(vWorkflowId),

  aiSdkToolCalls: v.optional(
    v.array(
      v.object({
        toolCallId: v.string(),
        toolName: v.string(),
        input: v.optional(v.any()),
        output: v.optional(v.any()),
        error: v.optional(v.any()),
      }),
    ),
  ),
})
  .index("by_accountSid_messageSid", ["accountSid", "messageSid"])
  .index("by_organizationId", ["organizationId"])
  .index("by_organizationId_twilioMessageBroadcastId", [
    "organizationId",
    "twilioMessageBroadcastId",
  ])
  .index("by_organizationId_contactId", ["organizationId", "contactId"]);
