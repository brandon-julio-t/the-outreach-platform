import { defineTable } from "convex/server";
import { v } from "convex/values";

export const twilioSettings = defineTable({
  organizationId: v.id("organizations"),
  accountSid: v.string(),
  authToken: v.string(),
  phoneNumber: v.string(),
}).index("by_organizationId_accountSid", ["organizationId", "accountSid"]);

export const twilioMessages = defineTable({
  organizationId: v.id("organizations"),
  userId: v.id("users"),
  displayName: v.string(),
  role: v.union(v.literal("user"), v.literal("assistant")),
  contactId: v.optional(v.id("contacts")),

  from: v.string(),
  to: v.string(),
  body: v.string(),
  messageSid: v.string(),
  accountSid: v.string(),
  apiVersion: v.string(),
  direction: v.string(),
  errorCode: v.optional(v.string()),
  errorMessage: v.optional(v.string()),
  status: v.string(),

  lastUpdatedAt: v.optional(v.number()),
  rawResponseJson: v.optional(v.any()),
  workflowId: v.optional(v.string()),
})
  .index("by_accountSid_messageSid", ["accountSid", "messageSid"])
  .index("by_organizationId", ["organizationId"]);
