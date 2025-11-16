import { vWorkflowId } from "@convex-dev/workflow";
import { defineTable } from "convex/server";
import { v } from "convex/values";

export const twilioSettings = defineTable({
  organizationId: v.id("organizations"),
  accountSid: v.string(),
  authToken: v.string(),
  phoneNumber: v.string(),
})
  .index("by_organizationId", ["organizationId"])
  .index("by_accountSid", ["accountSid"]);

export const twilioMessageTemplates = defineTable({
  organizationId: v.id("organizations"),
  name: v.string(),
  messageLanguage: v.string(),
  messageTemplate: v.string(),
  messageVariables: v.record(v.string(), v.string()),
  messageMedia: v.optional(v.string()),
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

export const twilioMessageBroadcasts = defineTable({
  organizationId: v.id("organizations"),
  userId: v.id("users"),
  twilioMessageTemplateId: v.id("twilioMessageTemplates"),
  contentSid: v.string(),
  contentVariables: v.record(v.string(), v.string()),
}).index("by_organizationId", ["organizationId"]);

export const twilioMessages = defineTable({
  organizationId: v.id("organizations"),
  displayName: v.string(),
  role: v.union(v.literal("user"), v.literal("assistant")),
  userId: v.optional(v.id("users")),
  contactId: v.optional(v.id("contacts")),
  twilioMessageBroadcastId: v.optional(v.id("twilioMessageBroadcasts")),

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
})
  .index("by_accountSid_messageSid", ["accountSid", "messageSid"])
  .index("by_organizationId", ["organizationId"])
  .index("by_organizationId_twilioMessageBroadcastId", [
    "organizationId",
    "twilioMessageBroadcastId",
  ]);
