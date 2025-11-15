import { defineTable } from "convex/server";
import { v } from "convex/values";

export const twilioSettings = defineTable({
  organizationId: v.id("organizations"),
  accountSid: v.string(),
  authToken: v.string(),
  phoneNumber: v.string(),
}).index("by_organizationId_accountSid", ["organizationId", "accountSid"]);
