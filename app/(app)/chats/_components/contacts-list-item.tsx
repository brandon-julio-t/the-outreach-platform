import { Message, MessageResponse } from "@/components/ai-elements/message";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { FunctionReturnType } from "convex/server";
import { format, formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useParams } from "next/navigation";

type ContactData = FunctionReturnType<
  typeof api.domains.contacts.queries.getContacts
>["page"][number];

export function ContactsListItem({ contact }: { contact: ContactData }) {
  const params = useParams();
  const contactId = params.contactId?.toString();

  const isActive = contactId === contact._id;

  const humanTime = contact.latestMessageTime
    ? format(contact.latestMessageTime, "PPp")
    : "";
  const relativeTime = contact.latestMessageTime
    ? formatDistanceToNow(contact.latestMessageTime, { addSuffix: true })
    : "";

  const currentOrganization = useQuery(
    api.domains.organizations.queries.getCurrentUserActiveOrganization,
  );

  const latestMessage = useQuery(
    api.domains.twilioMessages.queries.getLatestTwilioMessagesByContactId,
    currentOrganization?._id
      ? {
          organizationId: currentOrganization._id,
          contactId: contact._id,
        }
      : "skip",
  );

  return (
    <Item variant={isActive ? "muted" : "default"} asChild>
      <Link href={`/chats/${contact._id}`}>
        <ItemContent>
          <ItemTitle className="w-full items-baseline">
            <div className="truncate">{contact.name}</div>

            <Tooltip>
              <TooltipTrigger className="text-muted-foreground ml-auto shrink-0 text-xs">
                {relativeTime}
              </TooltipTrigger>
              <TooltipContent side="right">{humanTime}</TooltipContent>
            </Tooltip>
          </ItemTitle>

          <Tooltip>
            <TooltipTrigger asChild>
              <ItemDescription className="line-clamp-1">
                {latestMessage?.body ? (
                  <MessageResponse>{latestMessage.body}</MessageResponse>
                ) : (
                  contact.phone
                )}
              </ItemDescription>
            </TooltipTrigger>
            <TooltipContent side="right">
              {latestMessage?.body ? (
                <Message from="assistant">
                  <div className="text-xs">{latestMessage.displayName}</div>
                  <MessageResponse>{latestMessage.body}</MessageResponse>
                </Message>
              ) : (
                contact.phone
              )}
            </TooltipContent>
          </Tooltip>
        </ItemContent>
      </Link>
    </Item>
  );
}
