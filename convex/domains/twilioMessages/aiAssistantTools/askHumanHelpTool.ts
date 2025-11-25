import { tool } from "ai";
import { z } from "zod";
import { internal } from "../../../_generated/api";
import { Id } from "../../../_generated/dataModel";
import { ActionCtx } from "../../../_generated/server";

export const askHumanHelpTool = ({
  ctx,
  contactId,
  organizationId,
}: {
  ctx: ActionCtx;
  contactId: Id<"contacts">;
  organizationId: Id<"organizations">;
}) =>
  tool({
    description: [
      "Ask for human help.",
      "Call this tool when you are stuck or the contact is getting frustrated, angry, etc.",
      "This tool will send a message to the human to help you with the task.",
    ].join("\n"),
    inputSchema: z.object({
      reasoning: z
        .string()
        .describe(
          [
            "This reasoning describes the details of the task you are stuck on.",
          ].join("\n"),
        ),
    }),
    execute: async (toolInputArgs) => {
      console.log("askHumanHelpTool args", {
        toolInputArgs,
        contactId,
        organizationId,
      });

      await ctx.runMutation(internal.domains.contacts.internalCrud.update, {
        id: contactId,
        patch: {
          aiAssistantDisabledTime: Date.now(),
          aiAssistantDisabledReason: toolInputArgs.reasoning,
          lastUpdateTime: Date.now(),
        },
      });

      return {
        ok: true,
        message: "Human help has been requested successfully.",
      };
    },
  });
