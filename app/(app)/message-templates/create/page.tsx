"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Item, ItemContent, ItemGroup } from "@/components/ui/item";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function CreateMessageTemplatePage() {
  const form = useForm({
    mode: "onTouched",
    resolver: zodResolver(
      z.object({
        name: z.string().nonempty(),
        messageLanguage: z.string().nonempty(),
        messageTemplate: z.string().nonempty(),
        messageVariables: z.record(z.string(), z.string()),
        messageMedia: z.string().optional(),
        messageCategory: z.enum(["marketing", "utility"]),
      }),
    ),
    defaultValues: {
      name: "",
      messageLanguage: "en",
      messageTemplate: "",
      messageVariables: {},
      messageMedia: "",
      messageCategory: "marketing",
    },
  });

  const createTwilioMessageTemplate = useMutation(
    api.domains.twilioMessageTemplates.mutations.createTwilioMessageTemplate,
  );

  const onSubmit = form.handleSubmit(
    async (data) => {
      await toast
        .promise(createTwilioMessageTemplate(data), {
          loading: "Creating message template...",
          success:
            "Create message template request has been submitted successfully",
          error: "Failed to submit create message template request",
        })
        .unwrap();
    },
    (error) => {
      console.error("error", error);
      toast.error("Failed to create message template", {
        description: "Please check your form and try again.",
      });
    },
  );

  return (
    <form onSubmit={onSubmit} className="container mx-auto">
      <ItemGroup>
        <Item>
          <ItemContent>
            <FieldGroup>
              <FieldSet>
                <FieldLegend>Message Template Details</FieldLegend>
                <FieldGroup>
                  <Controller
                    name="name"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                        <Input
                          {...field}
                          aria-invalid={fieldState.invalid}
                          id={field.name}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="messageTemplate"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>
                          Message Template
                        </FieldLabel>
                        <Textarea
                          {...field}
                          aria-invalid={fieldState.invalid}
                          id={field.name}
                          rows={7}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </FieldGroup>
              </FieldSet>

              <FieldSeparator />

              <FieldSet>
                <FieldLegend>Message Category</FieldLegend>
                <FieldDescription>
                  This entire template will be submitted for WhatsApp approval.
                  WhatsApp usually approves or rejects template submissions in
                  48 hours or less.
                </FieldDescription>
                <FieldGroup>
                  <Controller
                    name="messageCategory"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <RadioGroup
                        {...field}
                        onValueChange={field.onChange}
                        aria-invalid={fieldState.invalid}
                        className="flex flex-col gap-2 md:flex-row"
                      >
                        {[
                          {
                            label: "Marketing",
                            description:
                              "Include promotions or offers, informational updates, or invitations for customers to respond / take action. Any conversation that does not qualify as utility or authentication is a marketing conversation.",
                            value: "marketing",
                          },
                          {
                            label: "Utility",
                            description:
                              "Facilitate a specific, agreed-upon request or transaction or update to a customer about an ongoing transaction, including post-purchase notifications and recurring billing statements.",
                            value: "utility",
                          },
                        ].map((item) => (
                          <FieldLabel key={item.value} htmlFor={item.value}>
                            <Field
                              orientation="horizontal"
                              data-invalid={fieldState.invalid}
                            >
                              <RadioGroupItem
                                value={item.value}
                                id={item.value}
                                aria-invalid={fieldState.invalid}
                              />
                              <FieldContent>
                                <FieldTitle>{item.label}</FieldTitle>
                                <FieldDescription>
                                  {item.description}
                                </FieldDescription>
                              </FieldContent>
                            </Field>
                          </FieldLabel>
                        ))}
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </RadioGroup>
                    )}
                  />
                </FieldGroup>
              </FieldSet>

              <Field orientation="horizontal" className="justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && <Spinner />}
                  Create Message Template
                </Button>
              </Field>
            </FieldGroup>
          </ItemContent>
        </Item>
      </ItemGroup>
    </form>
  );
}
