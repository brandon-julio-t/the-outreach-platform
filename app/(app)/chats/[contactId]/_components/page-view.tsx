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
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import { TwilioMessageStatusIcon } from "@/components/domains/twilio-messages";
import { ImageZoom } from "@/components/kibo-ui/image-zoom";
import { Button } from "@/components/ui/button";
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
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getTwilioMessageError } from "@/lib/domains/twilio-messages";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePaginatedQuery, useQuery } from "convex-helpers/react/cache/hooks";
import { useMutation } from "convex/react";
import { format, isToday } from "date-fns";
import {
  MessageSquareCodeIcon,
  MessageSquareIcon,
  PanelRightIcon,
  SendIcon,
  SidebarOpenIcon,
} from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
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
              <SidebarTrigger>
                <PanelRightIcon />
              </SidebarTrigger>
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

              const { isError, errorCode, errorMessage, docsUrl } =
                getTwilioMessageError({
                  message,
                });

              return (
                <React.Fragment key={message._id}>
                  {message.aiSdkToolCalls?.map((toolCall) => (
                    <Tool key={toolCall.toolName}>
                      <ToolHeader
                        title={toolCall.toolName}
                        type={`tool-${toolCall.toolName}`}
                        state={
                          toolCall.error ? "output-error" : "output-available"
                        }
                        className="overflow-auto"
                      />
                      <ToolContent>
                        <ToolInput input={toolCall.input} />
                        {toolCall.error && (
                          <ToolOutput
                            output={undefined}
                            errorText={toolCall.error}
                          />
                        )}
                      </ToolContent>
                    </Tool>
                  ))}

                  <Message
                    from={reversedRole}
                    aria-invalid={!!isError}
                    aria-errormessage={errorMessage}
                  >
                    <MessageContent
                      className={cn(
                        "break-all",

                        "group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground group-[.is-user]:ml-auto group-[.is-user]:rounded-xl group-[.is-user]:rounded-br-xs group-[.is-user]:px-4 group-[.is-user]:py-3",
                        "group-[.is-assistant]:bg-secondary group-[.is-assistant]:text-foreground group-[.is-assistant]:mr-auto group-[.is-assistant]:rounded-xl group-[.is-assistant]:rounded-bl-xs group-[.is-assistant]:px-4 group-[.is-assistant]:py-3",

                        "group-aria-invalid:border-destructive group-aria-invalid:border-2",
                      )}
                    >
                      {message.twilioMessageTemplate?.messageMedia && (
                        <ImageZoom className="bg-muted relative aspect-square size-32 overflow-hidden rounded-lg">
                          <Image
                            unoptimized
                            fill
                            src={message.twilioMessageTemplate?.messageMedia}
                            alt="Message media"
                            className="object-cover"
                          />
                        </ImageZoom>
                      )}

                      <div className="text-xs">{message.displayName}</div>

                      <MessageResponse
                        className="list-inside"
                        mode="static"
                        isAnimating={false}
                      >
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
                          <TooltipTrigger>
                            <TwilioMessageStatusIcon message={message} />
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            sideOffset={4}
                            className="capitalize"
                          >
                            {message.status}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </MessageContent>

                    {isError && (
                      <div className="text-destructive text-right text-xs">
                        {docsUrl && (
                          <div>
                            <a
                              target="_blank"
                              href={docsUrl}
                              rel="noreferrer noopener"
                              className="underline"
                            >
                              {errorCode}
                            </a>
                          </div>
                        )}

                        {errorMessage && <div>{errorMessage}</div>}
                      </div>
                    )}
                  </Message>
                </React.Fragment>
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
