"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "@bprogress/next/app";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePaginatedQuery, useQuery } from "convex-helpers/react/cache/hooks";
import { useMutation } from "convex/react";
import { motion } from "motion/react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

export default function CreateBroadcastPage() {
  const currentOrganization = useQuery(
    api.domains.organizations.queries.getCurrentUserActiveOrganization,
  );

  const contactsQuery = usePaginatedQuery(
    api.domains.contacts.queries.getContacts,
    currentOrganization?._id
      ? {
          organizationId: currentOrganization._id,
        }
      : "skip",
    {
      initialNumItems: 50,
    },
  );

  const onLoadMoreContacts = () => {
    if (contactsQuery.status === "CanLoadMore") {
      contactsQuery.loadMore(100);
    }
  };

  const twilioMessageTemplatesQuery = usePaginatedQuery(
    api.domains.twilioMessageTemplates.queries.getTwilioMessageTemplates,
    currentOrganization?._id
      ? {
          organizationId: currentOrganization._id,
        }
      : "skip",
    {
      initialNumItems: 50,
    },
  );

  const onLoadMoreTwilioMessageTemplates = () => {
    if (twilioMessageTemplatesQuery.status === "CanLoadMore") {
      twilioMessageTemplatesQuery.loadMore(100);
    }
  };

  const form = useForm({
    mode: "onTouched",
    resolver: zodResolver(
      z.object({
        twilioMessageTemplateId: z.string().nonempty(),
        contentVariables: z.record(z.string(), z.string()),
        contacts: z
          .array(
            z.object({
              id: z.string(),
              name: z.string().nullish(),
              phone: z.string().nullish(),
            }),
          )
          .nonempty(),
      }),
    ),
    defaultValues: {
      twilioMessageTemplateId: "",
      contentVariables: {},
      contacts: [],
    },
  });

  const broadcastWhatsAppMessagesViaTwilio = useMutation(
    api.domains.twilioMessageBroadcasts.mutations
      .broadcastWhatsAppMessagesViaTwilio,
  );

  const router = useRouter();

  const onSubmit = form.handleSubmit(
    async (data) => {
      await toast
        .promise(
          broadcastWhatsAppMessagesViaTwilio({
            twilioMessageTemplateId:
              data.twilioMessageTemplateId as Id<"twilioMessageTemplates">,
            contentVariables: data.contentVariables,
            contactIds: data.contacts.map(
              (contact) => contact.id as Id<"contacts">,
            ),
          }),
          {
            loading: "Broadcasting WhatsApp messages...",
            success: "WhatsApp messages broadcasted successfully",
            error: "Failed to broadcast WhatsApp messages",
          },
        )
        .unwrap();

      router.push("/broadcasts");
    },
    (error) => {
      console.error(error);
      toast.error("Failed to create broadcast", {
        description: "Please check your form and try again.",
      });
    },
  );

  return (
    <form onSubmit={onSubmit} className="container mx-auto">
      <Item>
        <ItemContent>
          <ItemTitle>Create Broadcast</ItemTitle>
          <ItemDescription>
            Create a new broadcast for your outreach campaigns.
          </ItemDescription>
        </ItemContent>
      </Item>

      <Item variant="outline" className="mx-4">
        <ItemContent className="w-full">
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Choose Twilio Message Template</FieldLegend>
              <FieldDescription>
                Choose a twilio message template to use for your broadcast.
              </FieldDescription>

              <FieldGroup>
                {twilioMessageTemplatesQuery.status === "LoadingFirstPage" ? (
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Spinner />
                      </EmptyMedia>
                      <EmptyTitle>
                        Loading twilio message templates...
                      </EmptyTitle>
                      <EmptyDescription>
                        We are loading your twilio message templates. Please
                        wait a moment.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : twilioMessageTemplatesQuery.results.length === 0 ? (
                  <Empty>
                    <EmptyHeader>
                      <EmptyTitle>
                        No twilio message templates found.
                      </EmptyTitle>
                      <EmptyDescription>
                        You don&apos;t have any twilio message templates yet.
                        You can add a new twilio message template by clicking
                        the button below.
                      </EmptyDescription>
                      <EmptyContent>
                        <Button asChild>
                          <Link href="/message-templates/create">
                            Add Twilio Message Template
                          </Link>
                        </Button>
                      </EmptyContent>
                    </EmptyHeader>
                  </Empty>
                ) : (
                  <Controller
                    name="twilioMessageTemplateId"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <RadioGroup
                        {...field}
                        onValueChange={field.onChange}
                        aria-invalid={fieldState.invalid}
                        className="max-h-96 overflow-y-auto"
                      >
                        {twilioMessageTemplatesQuery.results.map(
                          (twilioMessageTemplate) => {
                            return (
                              <FieldLabel
                                key={twilioMessageTemplate._id}
                                htmlFor={twilioMessageTemplate._id}
                                aria-invalid={fieldState.invalid}
                              >
                                <Field
                                  orientation="horizontal"
                                  data-invalid={fieldState.invalid}
                                >
                                  <RadioGroupItem
                                    id={twilioMessageTemplate._id}
                                    value={twilioMessageTemplate._id}
                                    aria-invalid={fieldState.invalid}
                                  />

                                  <FieldContent>
                                    <FieldTitle>
                                      {twilioMessageTemplate.name}
                                    </FieldTitle>

                                    <FieldDescription className="line-clamp-2">
                                      {twilioMessageTemplate.messageTemplate}
                                    </FieldDescription>
                                  </FieldContent>
                                </Field>
                              </FieldLabel>
                            );
                          },
                        )}

                        <Button
                          variant="outline"
                          disabled={
                            twilioMessageTemplatesQuery.isLoading ||
                            twilioMessageTemplatesQuery.status === "Exhausted"
                          }
                          onClick={onLoadMoreTwilioMessageTemplates}
                          asChild
                        >
                          <motion.button
                            onViewportEnter={onLoadMoreTwilioMessageTemplates}
                          >
                            {twilioMessageTemplatesQuery.isLoading && (
                              <Spinner />
                            )}
                            {twilioMessageTemplatesQuery.status === "Exhausted"
                              ? "No more twilio message templates"
                              : "Load More"}
                          </motion.button>
                        </Button>

                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </RadioGroup>
                    )}
                  />
                )}
              </FieldGroup>
            </FieldSet>

            <FieldSet>
              <FieldLegend>Choose Twilio Message Template</FieldLegend>
              <FieldDescription>
                Choose a twilio message template to use for your broadcast.
              </FieldDescription>
              <FieldGroup>
                {twilioMessageTemplatesQuery.status === "LoadingFirstPage" ? (
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Spinner />
                      </EmptyMedia>
                      <EmptyTitle>
                        Loading twilio message templates...
                      </EmptyTitle>
                      <EmptyDescription>
                        We are loading your twilio message templates. Please
                        wait a moment.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : twilioMessageTemplatesQuery.results.length === 0 ? (
                  <Empty>
                    <EmptyHeader>
                      <EmptyTitle>
                        No twilio message templates found.
                      </EmptyTitle>
                      <EmptyDescription>
                        You don&apos;t have any twilio message templates yet.
                        You can add a new twilio message template by clicking
                        the button below.
                      </EmptyDescription>
                      <EmptyContent>
                        <Button asChild>
                          <Link href="/message-templates/create">
                            Add Twilio Message Template
                          </Link>
                        </Button>
                      </EmptyContent>
                    </EmptyHeader>
                  </Empty>
                ) : (
                  <Controller
                    name="contacts"
                    control={form.control}
                    render={({ field, fieldState }) => {
                      const areAllSelected =
                        contactsQuery.results.length === field.value.length;

                      return (
                        <>
                          <Field orientation="horizontal">
                            <Checkbox
                              id="choose-all"
                              aria-invalid={fieldState.invalid}
                              value="choose-all"
                              checked={areAllSelected}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange(
                                    contactsQuery.results.map((contact) => ({
                                      id: contact._id,
                                      name: contact.name,
                                      phone: contact.phone,
                                    })),
                                  );
                                } else {
                                  field.onChange([]);
                                }
                              }}
                            />
                            <FieldLabel htmlFor="choose-all">
                              Choose all ({Number(field.value.length)} selected)
                            </FieldLabel>
                          </Field>

                          <Field className="max-h-96 overflow-y-auto">
                            {contactsQuery.results.map((contact) => {
                              const index = field.value.findIndex(
                                (c) => c.id === contact._id,
                              );
                              const isSelected = index !== -1;

                              return (
                                <FieldLabel
                                  key={contact._id}
                                  htmlFor={contact._id}
                                  aria-invalid={fieldState.invalid}
                                >
                                  <Field
                                    orientation="horizontal"
                                    data-invalid={fieldState.invalid}
                                  >
                                    <Checkbox
                                      id={contact._id}
                                      aria-invalid={fieldState.invalid}
                                      value={contact._id}
                                      checked={isSelected}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          field.onChange([
                                            ...field.value,
                                            {
                                              id: contact._id,
                                              name: contact.name,
                                              phone: contact.phone,
                                            },
                                          ]);
                                        } else {
                                          const clone = [...field.value];
                                          clone.splice(index, 1);
                                          field.onChange(clone);
                                        }
                                      }}
                                    />

                                    <FieldContent>
                                      <FieldTitle>{contact.name}</FieldTitle>

                                      <FieldDescription className="line-clamp-2">
                                        {contact.phone}
                                      </FieldDescription>
                                    </FieldContent>
                                  </Field>
                                </FieldLabel>
                              );
                            })}

                            <Button
                              variant="outline"
                              disabled={
                                contactsQuery.isLoading ||
                                contactsQuery.status === "Exhausted"
                              }
                              onClick={onLoadMoreContacts}
                              asChild
                            >
                              <motion.button
                                onViewportEnter={onLoadMoreContacts}
                              >
                                {contactsQuery.isLoading && <Spinner />}
                                {contactsQuery.status === "Exhausted"
                                  ? "No more contacts"
                                  : "Load More"}
                              </motion.button>
                            </Button>

                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        </>
                      );
                    }}
                  />
                )}
              </FieldGroup>
            </FieldSet>

            <Field orientation="horizontal" className="justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Spinner />}
                Submit Broadcast
              </Button>
            </Field>
          </FieldGroup>
        </ItemContent>
      </Item>
    </form>
  );
}
