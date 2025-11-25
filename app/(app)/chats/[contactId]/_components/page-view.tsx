"use client";

import { EditContactDialog } from "@/app/(app)/contacts/_components/edit-contact-dialog";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldError } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePaginatedQuery, useQuery } from "convex-helpers/react/cache/hooks";
import { useMutation } from "convex/react";
import { format, isToday } from "date-fns";
import {
  CheckCheckIcon,
  CheckIcon,
  HourglassIcon,
  MessageSquareCodeIcon,
  MessageSquareIcon,
  MoreVerticalIcon,
  PencilIcon,
  SendIcon,
  SidebarOpenIcon,
  XIcon,
} from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { ContactsListDrawer } from "../../_components/contacts-list-drawer";
import { ChooseMessageTemplateDrawer } from "./choose-message-template-drawer";

export function ChatDetailsPageView({
  contactId,
}: {
  contactId: Id<"contacts">;
}) {
  const currentOrganization = useQuery(
    api.domains.organizations.queries.getCurrentUserActiveOrganization,
  );

  const contactQuery = useQuery(
    api.domains.contacts.queries.getContactById,
    currentOrganization?._id
      ? {
          id: contactId,
          organizationId: currentOrganization._id,
        }
      : "skip",
  );

  const messagesQuery = usePaginatedQuery(
    api.domains.twilioMessages.queries.getTwilioMessagesByContactId,
    currentOrganization?._id
      ? {
          organizationId: currentOrganization._id,
          contactId: contactId,
        }
      : "skip",
    {
      initialNumItems: 50,
    },
  );

  const onLoadMore = () => {
    if (messagesQuery.status === "CanLoadMore") {
      messagesQuery.loadMore(100);
    }
  };

  const reversedMessages = messagesQuery.results.toReversed();

  const form = useForm({
    resolver: zodResolver(
      z.object({
        message: z.string().trim().nonempty(),
      }),
    ),
    defaultValues: {
      message: "",
    },
  });

  const sendWhatsAppMessageViaTwilio = useMutation(
    api.domains.twilioMessages.mutations.sendWhatsAppMessageViaTwilio,
  );

  const onSubmit = form.handleSubmit(
    async (data) => {
      if (!contactQuery) {
        toast.error("Contact not found", {
          description: "Please refresh the page and try again.",
        });
        return;
      }

      await toast
        .promise(
          sendWhatsAppMessageViaTwilio({
            contactId,
            receiverPhoneNumber: contactQuery.phone,
            body: data.message,
          }),
          {
            loading: "Sending message...",
            success: "Message sent successfully",
            error: "Failed to send message",
          },
        )
        .unwrap();

      form.reset();
    },
    (error) => {
      console.error(error);
      toast.error("Failed to send message", {
        description: "Please check your form and try again.",
      });
    },
  );

  const [openEdit, setOpenEdit] = React.useState(false);

  return (
    <section className="flex h-(--page-height) flex-col">
      <header className="border-b">
        <Item size="sm">
          <ItemActions className="flex md:hidden">
            <ContactsListDrawer>
              <Button size="icon-sm" variant="ghost">
                <SidebarOpenIcon className="rotate-270" />
              </Button>
            </ContactsListDrawer>
          </ItemActions>
          <ItemContent>
            <ItemTitle>{contactQuery?.name ?? <>&nbsp;</>}</ItemTitle>
            <ItemDescription>
              {contactQuery?.phone ?? <>&nbsp;</>}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            {contactQuery === undefined ? (
              <Button variant="ghost" size="icon">
                <Spinner />
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVerticalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setOpenEdit(true)}>
                    <PencilIcon />
                    Edit
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {contactQuery && (
              <EditContactDialog
                contact={contactQuery}
                open={openEdit}
                setOpen={setOpenEdit}
              />
            )}
          </ItemActions>
        </Item>
      </header>

      {messagesQuery.status === "LoadingFirstPage" ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Spinner />
            </EmptyMedia>
            <EmptyTitle>Loading messages...</EmptyTitle>
            <EmptyDescription>
              We are loading the messages for you. Please wait a moment.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : reversedMessages.length <= 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia>
              <MessageSquareIcon />
            </EmptyMedia>
            <EmptyTitle>Start a conversation</EmptyTitle>
            <EmptyDescription>
              Type a message below to begin chatting
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Conversation
          className="h-full flex-1 overflow-y-auto"
          initial="instant"
        >
          <ConversationContent>
            <Button
              variant="ghost"
              disabled={messagesQuery.status !== "CanLoadMore"}
              onClick={onLoadMore}
              asChild
            >
              <motion.button onViewportEnter={onLoadMore}>
                {messagesQuery.isLoading && <Spinner />}
                {messagesQuery.status === "Exhausted"
                  ? "No more messages"
                  : "Load More"}
              </motion.button>
            </Button>

            {reversedMessages.map((message) => {
              /** because we are the assistant */
              const reversedRole =
                message.role === "assistant" ? "user" : "assistant";

              const isMessageToday = isToday(message._creationTime);
              const displayTime = isMessageToday
                ? format(message._creationTime, "p")
                : format(message._creationTime, "PPp");

              const isError =
                message.errorCode ||
                message.errorMessage ||
                message.status === "failed";

              const errorMessage =
                message.errorMessage ||
                "The message could not be sent. This can happen for various reasons including queue overflows, account suspensions and media errors (in the case of MMS).";

              return (
                <Message
                  from={reversedRole}
                  key={message._id}
                  aria-invalid={!!isError}
                  aria-errormessage={isError ? errorMessage : undefined}
                >
                  <MessageContent
                    className={cn(
                      "break-all",

                      "group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground group-[.is-user]:ml-auto group-[.is-user]:rounded-xl group-[.is-user]:rounded-br-xs group-[.is-user]:px-4 group-[.is-user]:py-3",
                      "group-[.is-assistant]:bg-secondary group-[.is-assistant]:text-foreground group-[.is-assistant]:mr-auto group-[.is-assistant]:rounded-xl group-[.is-assistant]:rounded-bl-xs group-[.is-assistant]:px-4 group-[.is-assistant]:py-3",

                      "group-aria-invalid:border-destructive group-aria-invalid:border-2",
                    )}
                  >
                    <div className="text-xs">{message.displayName}</div>

                    <MessageResponse className="list-inside">
                      {message.body}
                    </MessageResponse>

                    <div className="flex flex-row items-center justify-end gap-2 text-xs">
                      <Tooltip>
                        <TooltipTrigger>{displayTime}</TooltipTrigger>
                        <TooltipContent side="bottom" sideOffset={4}>
                          {format(message._creationTime, "PPp")}
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        {message.status === "read" ? (
                          <TooltipTrigger asChild>
                            <CheckCheckIcon className="text-success size-(--text-xs)" />
                          </TooltipTrigger>
                        ) : message.status === "delivered" ? (
                          <TooltipTrigger asChild>
                            <CheckIcon className="text-info size-(--text-xs)" />
                          </TooltipTrigger>
                        ) : message.status === "failed" ? (
                          <TooltipTrigger asChild>
                            <XIcon className="text-destructive size-(--text-xs)" />
                          </TooltipTrigger>
                        ) : (
                          <TooltipTrigger asChild>
                            <HourglassIcon className="text-warning size-(--text-xs)" />
                          </TooltipTrigger>
                        )}
                        <TooltipContent side="bottom" sideOffset={4}>
                          {message.status}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </MessageContent>

                  <div className="text-destructive hidden text-right text-xs group-aria-invalid:block">
                    {message.errorCode && (
                      <div>
                        <a
                          target="_blank"
                          href={`https://www.twilio.com/docs/api/errors/${message.errorCode}`}
                          rel="noreferrer noopener"
                          className="underline"
                        >
                          {message.errorCode}
                        </a>
                      </div>
                    )}

                    {message.errorMessage && <div>{message.errorMessage}</div>}

                    {message.status === "failed" && (
                      <div>
                        <a
                          target="_blank"
                          href={`https://help.twilio.com/articles/223134347-What-are-the-Possible-SMS-and-MMS-Message-Statuses-and-What-do-They-Mean-`}
                          rel="noreferrer noopener"
                          className="underline"
                        >
                          {errorMessage}
                        </a>
                      </div>
                    )}
                  </div>
                </Message>
              );
            })}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      )}

      <form onSubmit={onSubmit} className="p-1 pt-0">
        <Controller
          control={form.control}
          name="message"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <InputGroup>
                <InputGroupTextarea
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="Type a message..."
                  className="max-h-1"
                />

                {fieldState.invalid && (
                  <InputGroupAddon align="block-end">
                    <InputGroupText>
                      <FieldError errors={[fieldState.error]} />
                    </InputGroupText>
                  </InputGroupAddon>
                )}

                <InputGroupAddon align="block-end" className="flex-wrap">
                  <ChooseMessageTemplateDrawer contact={contactQuery}>
                    <Button
                      type="button"
                      size="sm"
                      disabled={form.formState.isSubmitting}
                      variant="outline"
                      className="text-foreground"
                    >
                      {form.formState.isSubmitting ? (
                        <Spinner />
                      ) : (
                        <MessageSquareCodeIcon />
                      )}
                      Send Message Template
                    </Button>
                  </ChooseMessageTemplateDrawer>

                  <InputGroupButton
                    type="submit"
                    variant="default"
                    size="icon-sm"
                    className="ml-auto"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? <Spinner /> : <SendIcon />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </Field>
          )}
        />
      </form>
    </section>
  );
}
