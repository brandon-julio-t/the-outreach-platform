import { parsePhoneNumber } from "react-phone-number-input";
import z from "zod";

export const createBroadcastFormSchema = z.object({
  twilioMessageTemplateId: z.string().nonempty(),
  contentVariables: z.record(z.string(), z.string()),
  contacts: z
    .array(
      z.object({
        id: z.string().nullish(),
        phone: z.string().trim().nonempty(),
      }),
    )
    .nonempty(),
});

export type CreateBroadcastFormSchema = z.infer<
  typeof createBroadcastFormSchema
>;

export const importContactsForBroadcastRowSchema = z.object({
  phone: z
    .string()
    .trim()
    .nonempty()
    .transform((val, ctx) => {
      const result = parsePhoneNumber(val);
      if (!result) {
        ctx.addIssue({
          code: "custom",
          message: "Invalid phone number",
        });
        return z.NEVER;
      }
      return result.format("E.164");
    }),
});
