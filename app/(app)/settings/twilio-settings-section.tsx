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

export function TwilioSettingsSection() {
  const currentOrganization = useQuery(
    api.domains.organizations.queries.getCurrentUserActiveOrganization,
  );

  const twilioSettings = useQuery(
    api.domains.twilioSettings.queries.getTwilioSettings,
    currentOrganization?._id
      ? {
          organizationId: currentOrganization._id,
        }
      : "skip",
  );

  const form = useForm({
    mode: "onTouched",
    resolver: zodResolver(
      z.object({
        accountSid: z.string().nonempty(),
        authToken: z.string().nonempty(),
        phoneNumber: z.string().nonempty(),
      }),
    ),
    values: {
      accountSid: twilioSettings?.accountSid ?? "",
      authToken: twilioSettings?.authToken ?? "",
      phoneNumber: twilioSettings?.phoneNumber ?? "",
    },
  });

  const upsertTwilioSettings = useMutation(
    api.domains.twilioSettings.mutations.upsertTwilioSettings,
  );

  const onSubmit = form.handleSubmit(
    async (data) => {
      await toast
        .promise(upsertTwilioSettings(data), {
          loading: "Updating Twilio settings...",
          success: "Twilio settings updated successfully",
          error: "Failed to update Twilio settings",
        })
        .unwrap();
    },
    (error) => {
      console.error(error);
      toast.error("Failed to update Twilio settings", {
        description: "Please check your form and try again.",
      });
    },
  );

  return (
    <Item variant="outline" className="mx-4">
      <ItemContent>
        <ItemTitle>
          Twilio Settings {twilioSettings === undefined && <Spinner />}
        </ItemTitle>
        <ItemDescription>
          Configure your Twilio account credentials to be used for sending
          outbound messages.
        </ItemDescription>
      </ItemContent>

      <ItemContent className="w-full">
        <form onSubmit={onSubmit}>
          <FieldGroup>
            <Controller
              name="accountSid"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Account SID</FieldLabel>
                  <Input {...field} id={field.name} />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="authToken"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Auth Token</FieldLabel>
                  <Input {...field} id={field.name} type="password" />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="phoneNumber"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Phone Number</FieldLabel>
                  <Input {...field} id={field.name} />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Field orientation="horizontal">
              <Button
                type="submit"
                className="ml-auto"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting && <Spinner />}
                Save Settings
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </ItemContent>
    </Item>
  );
}
