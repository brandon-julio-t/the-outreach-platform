import { openai, OpenAIResponsesProviderOptions } from "@ai-sdk/openai";
import { LanguageModelV2ToolResultOutput } from "@ai-sdk/provider";
import {
  AssistantModelMessage,
  generateText,
  ModelMessage,
  stepCountIs,
  UserModelMessage,
} from "ai";
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

    if (contact?.aiAssistantDisabledTime) {
      console.log("AI assistant is disabled for contact", contact._id);
      return;
    }

    const systemPromptBuilder = [
      aiAssistantSettings?.systemPrompt ??
        `You are a helpful assistant that can answer questions and help with tasks.`,
    ];

    if (contact) {
      systemPromptBuilder.push(
        `<contact_data>`,

        `Name: ${contact.name}`,
        `Phone (E.164): ${contact.phone}`,
        `Country: infer from the phone number`,
        `Language: infer from the phone number`,
        `Timezone: infer from the phone number`,
        `Currency: infer from the phone number`,

        `Latest message time: ${contact.latestMessageTime ?? "N/A"}`,
        `Last user reply time: ${contact.lastUserReplyTime ? format(contact.lastUserReplyTime, "PPPPpppp") : "N/A"}`,

        `Goals achieved: ${contact.goalsAchievedTime ? "Yes" : "No"}`,
        `Goals achieved note: ${contact.goalsAchievedNote || "N/A"}`,
        `Goals achieved time: ${contact.goalsAchievedTime ? format(contact.goalsAchievedTime, "PPPPpppp") : "N/A"}`,
        `</contact_data>`,
      );
    }

    systemPromptBuilder.push(
      `<system_information>`,
      `System time: ${format(new Date(), "PPPPpppp")}`,
      `</system_information>`,
    );

    const systemAiSdk = systemPromptBuilder.join("\n").trim();

    console.log("systemAiSdk", systemAiSdk);

    const messagesAiSdk: ModelMessage[] = pastMessages.flatMap((message) => {
      if (message.role === "user") {
        return {
          role: "user",
          content: message.body,
        } satisfies UserModelMessage;
      }

      const contentBuilder: AssistantModelMessage["content"] = [];

      if (message.aiSdkToolCalls?.length) {
        message.aiSdkToolCalls.forEach((toolCall) => {
          const isError = !!toolCall.error;
          let toolResultOutput: LanguageModelV2ToolResultOutput = {
            type: "json",
            value: toolCall.output,
          };

          if (isError) {
            const isText = typeof toolCall.error === "string";
            toolResultOutput = {
              type: isText ? "error-text" : "error-json",
              value: toolCall.error,
            };
          } else {
            const isText = typeof toolCall.output === "string";
            toolResultOutput = {
              type: isText ? "text" : "json",
              value: toolCall.output,
            };
          }

          contentBuilder.push({
            type: "tool-result",
            toolCallId: toolCall.toolCallId,
            toolName: toolCall.toolName,
            output: toolResultOutput,
          });
        });
      }

      contentBuilder.push({
        type: "text",
        text: message.body,
      });

      return {
        role: "assistant",
        content: contentBuilder,
      } satisfies AssistantModelMessage;
    });

    console.log("messagesAiSdk", messagesAiSdk);

    const response = await generateText({
      model: openai(aiAssistantSettings?.modelId ?? "gpt-5.1"),

      providerOptions: {
        openai: {
          /**
           * @see https://github.com/vercel/ai/issues/9119
           * @see https://github.com/vercel/ai/issues/10290
           * @see https://github.com/vercel/ai/issues/8379
           * @see https://github.com/vercel/ai/issues/8811
           */
          store: false,
        } satisfies OpenAIResponsesProviderOptions,
      },

      system: systemAiSdk,

      messages: messagesAiSdk,

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
            toolCallId: c.toolCallId,
            toolName: c.toolName,
            input: c.input,
            output: c.output,
            error: undefined,
          };
        }

        if (c.type === "tool-error") {
          return {
            toolCallId: c.toolCallId,
            toolName: c.toolName,
            input: c.input,
            output: undefined,
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
