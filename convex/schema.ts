import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { aiAssistantSettings } from "./tables/aiAssistant";
import { contacts } from "./tables/contacts";
import { organizationMembers, organizations } from "./tables/organizations";
import {
  twilioMessageBroadcasts,
  twilioMessages,
  twilioMessageTemplates,
  twilioSettings,
} from "./tables/twilio";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,

  authSessions: defineTable({
    userId: v.id("users"),
    expirationTime: v.number(),
    organizationId: v.optional(v.id("organizations")),
  }).index("userId", ["userId"]),

  organizations: organizations,
  organizationMembers: organizationMembers,

  contacts: contacts,

  twilioSettings: twilioSettings,
  twilioMessageTemplates: twilioMessageTemplates,
  twilioMessageBroadcasts: twilioMessageBroadcasts,
  twilioMessages: twilioMessages,

  aiAssistantSettings: aiAssistantSettings,
});
