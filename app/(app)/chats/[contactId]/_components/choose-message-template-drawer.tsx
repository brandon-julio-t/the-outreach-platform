import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePaginatedQuery, useQuery } from "convex-helpers/react/cache/hooks";
import { useMutation } from "convex/react";
import { motion } from "motion/react";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

export function ChooseMessageTemplateDrawer({
  children,
  contact,
}: {
  children: React.ReactNode;
  contact: Doc<"contacts"> | null | undefined;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="container mx-auto">
        <DrawerBody contact={contact} onSuccess={() => setOpen(false)} />
      </DrawerContent>
    </Drawer>
  );
}

function DrawerBody({
  contact,
  onSuccess,
}: {
  contact: Doc<"contacts"> | null | undefined;
  onSuccess: () => void;
}) {
  const currentOrganization = useQuery(
    api.domains.organizations.queries.getCurrentUserActiveOrganization,
  );

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

  const onLoadMore = () => {
    if (twilioMessageTemplatesQuery.status === "CanLoadMore") {
      twilioMessageTemplatesQuery.loadMore(100);
    }
  };

  const form = useForm({
    mode: "onTouched",
    resolver: zodResolver(
      z.object({
        twilioMessageTemplateId: z.string().min(1),
      }),
    ),
    defaultValues: {
      twilioMessageTemplateId: "",
    },
  });

  const sendWhatsAppMessageViaTwilio = useMutation(
    api.domains.twilioMessages.mutations.sendWhatsAppMessageViaTwilio,
  );

  const onSubmit = form.handleSubmit(
    async (data) => {
      if (!contact) {
        toast.error("Contact not found", {
          description: "Please refresh the page and try again.",
        });
        return;
      }

      await toast
        .promise(
          sendWhatsAppMessageViaTwilio({
            contactId: contact._id,
            receiverPhoneNumber: contact.phone,
            contentSid: data.twilioMessageTemplateId,
          }),
          {
            loading: "Sending message...",
            success: "Message sent successfully",
            error: "Failed to send message",
          },
        )
        .unwrap();

      onSuccess();
    },
    (error) => {
      console.error(error);
      toast.error("Failed to send message", {
        description: "Please check your form and try again.",
      });
    },
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onSubmit(e);
      }}
    >
      <FieldSet>
        <DrawerHeader>
          <DrawerTitle>Choose Message Template</DrawerTitle>
          <DrawerDescription>
            Choose a message template to send to the contact.
          </DrawerDescription>
        </DrawerHeader>

        <FieldGroup className="px-4">
          {twilioMessageTemplatesQuery.status === "LoadingFirstPage" ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Spinner />
                </EmptyMedia>
                <EmptyTitle>Loading message templates...</EmptyTitle>
                <EmptyDescription>
                  We are loading your message templates. Please wait a moment.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : twilioMessageTemplatesQuery.results.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No message templates found.</EmptyTitle>
                <EmptyDescription>
                  You don&apos;t have any message templates yet. You can add a
                  new message template by clicking the button below.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <Controller
                name="twilioMessageTemplateId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <RadioGroup
                    {...field}
                    onValueChange={field.onChange}
                    aria-invalid={fieldState.invalid}
                  >
                    {twilioMessageTemplatesQuery.results.map(
                      (twilioMessageTemplate) => (
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
                            </FieldContent>
                          </Field>
                        </FieldLabel>
                      ),
                    )}
                  </RadioGroup>
                )}
              />

              <Button
                type="button"
                variant="outline"
                onClick={onLoadMore}
                disabled={
                  twilioMessageTemplatesQuery.isLoading ||
                  twilioMessageTemplatesQuery.status === "Exhausted"
                }
                asChild
              >
                <motion.button onViewportEnter={onLoadMore}>
                  {twilioMessageTemplatesQuery.isLoading && <Spinner />}
                  {twilioMessageTemplatesQuery.status === "Exhausted"
                    ? "No more message templates"
                    : "Load More"}
                </motion.button>
              </Button>
            </>
          )}
        </FieldGroup>

        <DrawerFooter>
          <Button type="submit">Submit</Button>
          <DrawerClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </FieldSet>
    </form>
  );
}
