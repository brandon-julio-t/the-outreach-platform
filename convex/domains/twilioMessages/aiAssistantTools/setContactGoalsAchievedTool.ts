import { tool } from "ai";
import { z } from "zod";
import { internal } from "../../../_generated/api";
import { Id } from "../../../_generated/dataModel";
import { ActionCtx } from "../../../_generated/server";

export const setContactGoalsAchievedTool = ({
  ctx,
  contactId,
}: {
  ctx: ActionCtx;
  contactId: Id<"contacts">;
}) =>
  tool({
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
      console.log("setContactGoalsAchievedTool args", {
        toolInputArgs,
        contactId,
      });

      const prev = await ctx.runQuery(
        internal.domains.contacts.internalCrud.read,
        {
          id: contactId,
        },
      );

      if (prev?.goalsAchievedTime) {
        return {
          ok: false,
          message:
            "Contact goals have already been achieved, you cannot call this tool again.",
        };
      }

      await ctx.runMutation(internal.domains.contacts.internalCrud.update, {
        id: contactId,
        patch: {
          goalsAchievedTime: Date.now(),
          goalsAchievedNote: [prev?.goalsAchievedNote ?? "", toolInputArgs.note]
            .join("\n")
            .trim(),
          lastUpdateTime: Date.now(),
        },
      });

      return {
        ok: true,
        message:
          "Contact goals achieved has been set successfully, deals sealed, finalized, and closed.",
      };
    },
  });
