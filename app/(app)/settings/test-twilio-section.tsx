"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/convex/_generated/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { useMutation } from "convex/react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

export function TestTwilioSection() {
  const twilioSettings = useQuery(
    api.domains.twilioSettings.queries.getTwilioSettings,
  );

  const form = useForm({
    mode: "onTouched",
    resolver: zodResolver(
      z.object({
        receiverPhoneNumber: z.string().nonempty(),
        contentSid: z.string().nonempty(),
      }),
    ),
    defaultValues: {
      receiverPhoneNumber: "",
      contentSid: "",
    },
  });

  const sendTestMessage = useMutation(
    api.domains.twilioSettings.mutations.sendTestMessage,
  );

  const onSubmit = form.handleSubmit(
    async (data) => {
      await toast
        .promise(sendTestMessage(data), {
          loading: "Sending test message...",
          success: "Test message sent successfully",
          error: "Failed to send test message",
        })
        .unwrap();
    },
    (error) => {
      console.error(error);
      toast.error("Failed to send test message", {
        description: "Please check your form and try again.",
      });
    },
  );

  return (
    <Item variant="outline">
      <ItemContent>
        <ItemTitle>
          Test Twilio Settings {twilioSettings === undefined && <Spinner />}
        </ItemTitle>
        <ItemDescription>
          Test your Twilio settings by sending a test WhatsApp message to a
          phone number.
        </ItemDescription>
      </ItemContent>

      <ItemContent className="w-full">
        <form onSubmit={onSubmit}>
          <FieldGroup>
            <Controller
              name="receiverPhoneNumber"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Receiver Phone Number
                  </FieldLabel>
                  <Input {...field} id={field.name} type="tel" />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="contentSid"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Content SID</FieldLabel>
                  <Input {...field} id={field.name} />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Field orientation="horizontal">
              <Button type="submit" className="ml-auto">
                {form.formState.isSubmitting && <Spinner />}
                Send Test Message
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </ItemContent>
    </Item>
  );
}
