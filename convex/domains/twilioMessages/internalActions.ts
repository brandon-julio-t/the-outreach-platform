import { openai, OpenAIResponsesProviderOptions } from "@ai-sdk/openai";
import { generateText, ModelMessage, stepCountIs, tool } from "ai";
import { v } from "convex/values";
import { z } from "zod";
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

    const response = await generateText({
      model: openai(aiAssistantSettings?.modelId ?? "gpt-5.1"),

      providerOptions: {
        openai: {
          reasoningEffort: "none",
        } satisfies OpenAIResponsesProviderOptions,
      },

      system:
        aiAssistantSettings?.systemPrompt ??
        `You are a helpful assistant that can answer questions and help with tasks.`,

      messages: pastMessages.map((message) => {
        return {
          role: message.role,
          content: message.body,
        } satisfies ModelMessage;
      }),

      stopWhen: stepCountIs(10),

      tools: {
        set_contact_goals_achieved: tool({
          description: [
            "Set the contact goals achieved.",
            "Call this tool when your conversation with the contact has reached the goal set by the system prompt.",
            "This action is irreversible and cannot be undone, so make sure to only call this tool when you are sure that the contact has achieved the goal, all confirmations have been made, and deals are closed.",
          ].join("\n"),
          inputSchema: z.object({
            note: z
              .string()
              .describe(
                [
                  "This note describes the details of the goals achieved such as:",
                  "- the data that was requested by the system prompt and given by the contact.",
                  "- reason why you think the contact has achieved the goal.",
                  "- etc.",
                  "",
                  "This note will be read by the next team so please make it as detailed as possible.",
                  "So for example, if the topic is about ordering, then make sure to put the order and shipping details in this note.",
                ].join("\n"),
              ),
          }),
          execute: async (toolInputArgs) => {
            console.log("set_contact_goals_achieved", { toolInputArgs });

            const prev = await ctx.runQuery(
              internal.domains.contacts.internalCrud.read,
              {
                id: args.contactId,
              },
            );

            await ctx.runMutation(
              internal.domains.contacts.internalCrud.update,
              {
                id: args.contactId,
                patch: {
                  goalsAchievedTime: Date.now(),
                  goalsAchievedNote: [
                    prev?.goalsAchievedNote ?? "",
                    toolInputArgs.note,
                  ]
                    .join("\n")
                    .trim(),
                },
              },
            );

            return {
              ok: true,
              message:
                "Contact goals achieved has been set successfully, deals sealed, finalized, and closed.",
            };
          },
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
