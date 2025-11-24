"use client";

import { EditContactDialog } from "@/app/(app)/contacts/_components/edit-contact-dialog";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
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
  MessageSquareIcon,
  MoreVerticalIcon,
  PencilIcon,
  SendIcon,
} from "lucide-react";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

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
    mode: "onTouched",
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
      <div className="border-b">
        <Item>
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
      </div>

      <Conversation className="h-full flex-1 overflow-y-auto">
        <ConversationContent>
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
          ) : reversedMessages.length === 0 ? (
            <ConversationEmptyState
              icon={<MessageSquareIcon className="size-12" />}
              title="Start a conversation"
              description="Type a message below to begin chatting"
            />
          ) : (
            <>
              <Button
                variant="ghost"
                disabled={messagesQuery.status !== "CanLoadMore"}
                onClick={onLoadMore}
              >
                {messagesQuery.isLoading && <Spinner />}
                {messagesQuery.status === "Exhausted"
                  ? "No more messages"
                  : "Load More"}
              </Button>

              {reversedMessages.map((message) => {
                /** because we are the assistant */
                const reversedRole =
                  message.role === "assistant" ? "user" : "assistant";

                const isMessageToday = isToday(message._creationTime);
                const displayTime = isMessageToday
                  ? format(message._creationTime, "p")
                  : format(message._creationTime, "PPp");

                return (
                  <Message from={reversedRole} key={message._id}>
                    <MessageContent
                      className={cn(
                        "group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground group-[.is-user]:ml-auto group-[.is-user]:rounded-xl group-[.is-user]:rounded-br-xs group-[.is-user]:px-4 group-[.is-user]:py-3",
                        "group-[.is-assistant]:bg-secondary group-[.is-assistant]:text-foreground group-[.is-assistant]:mr-auto group-[.is-assistant]:rounded-xl group-[.is-assistant]:rounded-bl-xs group-[.is-assistant]:px-4 group-[.is-assistant]:py-3",
                      )}
                    >
                      <div className="text-xs">{message.displayName}</div>

                      <MessageResponse>{message.body}</MessageResponse>

                      <Tooltip>
                        <TooltipTrigger className="ml-auto text-xs">
                          {displayTime}
                        </TooltipTrigger>
                        <TooltipContent side="bottom" sideOffset={4}>
                          {format(message._creationTime, "PPp")}
                        </TooltipContent>
                      </Tooltip>
                    </MessageContent>
                  </Message>
                );
              })}
            </>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <form onSubmit={onSubmit} className="p-1 pt-0">
        <Controller
          control={form.control}
          name="message"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              <InputGroup>
                <InputGroupTextarea
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="Type a message..."
                />
                <InputGroupAddon align="block-end" className="border-t">
                  <InputGroupButton
                    type="submit"
                    size="icon-sm"
                    className="ml-auto"
                    disabled={!field.value || form.formState.isSubmitting}
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
