import { openai, OpenAIResponsesProviderOptions } from "@ai-sdk/openai";
import { generateText } from "ai";
import { v } from "convex/values";
import { workflow } from "../..";
import { internal } from "../../_generated/api";
import { internalAction } from "../../_generated/server";

export const generateAssistantReply = internalAction({
  args: {
    contactId: v.id("contacts"),
    contactPhone: v.string(),
    organizationId: v.id("organizations"),
    accountSid: v.string(),
    authToken: v.string(),
    senderPhone: v.string(),
  },
  handler: async (ctx, args): Promise<void> => {
    const pastMessages = await ctx.runQuery(
      internal.domains.twilioMessages.internalQueries
        .getContactPastMessagesForAiAssistant,
      {
        organizationId: args.organizationId,
        contactId: args.contactId,
      },
    );

    const response = await generateText({
      model: openai("gpt-5.1"),

      providerOptions: {
        openai: {
          reasoningEffort: "none",
        } satisfies OpenAIResponsesProviderOptions,
      },

      system: `You are a helpful assistant that can answer questions and help with tasks.`,

      messages: pastMessages.map((message) => ({
        role: message.role,
        content: message.body,
      })),
    });

    console.log("response", response);

    const workflowId = await workflow.start(
      ctx,
      internal.domains.twilioMessages.workflows
        .sendWhatsAppMessageViaTwilioWorkflow,
      {
        organizationId: args.organizationId,
        contactId: args.contactId,
        displayName: "AI Assistant",
        role: "assistant",
        accountSid: args.accountSid,
        authToken: args.authToken,
        from: args.senderPhone,
        to: args.contactPhone,
        body: response.text,
      },
    );

    console.log("workflowId", workflowId);
  },
});
