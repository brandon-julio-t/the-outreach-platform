import { openai, OpenAIResponsesProviderOptions } from "@ai-sdk/openai";
import { generateText, ModelMessage, stepCountIs } from "ai";
import { v } from "convex/values";
import { format } from "date-fns";
import { workflow } from "../..";
import { internal } from "../../_generated/api";
import { internalAction } from "../../_generated/server";
import { askHumanHelpTool } from "./aiAssistantTools/askHumanHelpTool";
import { setContactGoalsAchievedTool } from "./aiAssistantTools/setContactGoalsAchievedTool";

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

    console.log("pastMessages", pastMessages);

    const aiAssistantSettings = await ctx.runQuery(
      internal.domains.aiAssistantSettings.internalQueries
        .getAiAssistantSettingsByOrganizationId,
      {
        organizationId: args.organizationId,
      },
    );

    console.log("aiAssistantSettings", aiAssistantSettings);

    if (!aiAssistantSettings) {
      console.warn(
        "AI assistant settings not found for organization",
        args.organizationId,
      );
    }

    const contact = await ctx.runQuery(
      internal.domains.contacts.internalCrud.read,
      {
        id: args.contactId,
      },
    );

    console.log("contact", contact);

    const systemPromptBuilder = [
      aiAssistantSettings?.systemPrompt ??
        `You are a helpful assistant that can answer questions and help with tasks.`,
    ];

    if (contact) {
      systemPromptBuilder.push(
        `<contact_data>`,

        `Name: ${contact.name}`,
        `Phone: ${contact.phone}`,

        `Latest message time: ${contact.latestMessageTime ?? "N/A"}`,
        `Last user reply time: ${contact.lastUserReplyTime ?? "N/A"}`,

        `Goals achieved: ${contact.goalsAchievedTime ? "Yes" : "No"}`,
        `Goals achieved note: ${contact.goalsAchievedNote || "N/A"}`,
        `Goals achieved time: ${contact.goalsAchievedTime || "N/A"}`,
        `</contact_data>`,
      );
    }

    systemPromptBuilder.push(
      `<system_information>`,
      `System time: ${format(new Date(), "PPPPpppp")}`,
      `</system_information>`,
    );

    const response = await generateText({
      model: openai(aiAssistantSettings?.modelId ?? "gpt-5.1"),

      providerOptions: {
        openai: {
          reasoningEffort: "none",
        } satisfies OpenAIResponsesProviderOptions,
      },

      system: systemPromptBuilder.join("\n").trim(),

      messages: pastMessages.map((message) => {
        return {
          role: message.role,
          content: [
            `Message time: ${format(message._creationTime, "PPPPpppp")}`,
            `---`,
            message.body,
          ]
            .join("\n")
            .trim(),
        } satisfies ModelMessage;
      }),

      stopWhen: stepCountIs(10),

      tools: {
        set_contact_goals_achieved: setContactGoalsAchievedTool({
          ctx,
          contactId: args.contactId,
        }),

        ask_human_help: askHumanHelpTool({
          ctx,
          contactId: args.contactId,
          organizationId: args.organizationId,
        }),
      },
    });

    console.log("response", response);

    const aiSdkToolCalls = response.steps
      .flatMap((step) => step.content)
      .map((c) => {
        if (c.type === "tool-result") {
          return {
            toolName: c.toolName,
            input: c.input,
            error: undefined,
          };
        }

        if (c.type === "tool-error") {
          return {
            toolName: c.toolName,
            input: c.input,
            error: c.error,
          };
        }

        return null;
      })
      .filter((tc) => tc !== null);

    console.log("aiSdkToolCalls", aiSdkToolCalls);

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

        aiSdkToolCalls,
      },
    );

    console.log("workflowId", workflowId);
  },
});
