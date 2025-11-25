"use client";

import { TwilioMessageStatusIcon } from "@/components/domains/twilio-messages";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api } from "@/convex/_generated/api";
import { getTwilioMessageError } from "@/lib/domains/twilio-messages";
import { usePaginatedQuery, useQuery } from "convex-helpers/react/cache/hooks";
import { format } from "date-fns";

export default function OutboundMessagesPage() {
  const currentOrganization = useQuery(
    api.domains.organizations.queries.getCurrentUserActiveOrganization,
  );

  const twilioMessagesQuery = usePaginatedQuery(
    api.domains.twilioMessages.queries.getTwilioMessages,
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
    if (twilioMessagesQuery.status === "CanLoadMore") {
      twilioMessagesQuery.loadMore(100);
    }
  };

  return (
    <div className="container mx-auto">
      <ItemGroup>
        <Item>
          <ItemContent>
            <ItemTitle>Outbound Messages</ItemTitle>
            <ItemDescription>
              Outbound messages logs of your outreach campaigns.
            </ItemDescription>
          </ItemContent>
        </Item>

        <Item>
          <ItemContent className="w-full">
            {twilioMessagesQuery.status === "LoadingFirstPage" ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Spinner />
                  </EmptyMedia>
                  <EmptyTitle>Loading outbound messages...</EmptyTitle>
                  <EmptyDescription>
                    We are loading the outbound messages for you.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : twilioMessagesQuery.results.length === 0 ? (
              <Empty className="border">
                <EmptyHeader>
                  <EmptyTitle>No outbound messages found...</EmptyTitle>
                  <EmptyDescription>
                    You don&apos;t have any outbound messages yet.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Body</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Updated At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {twilioMessagesQuery.results.map((twilioMessage) => {
                      const { isError, errorCode, errorMessage, docsUrl } =
                        getTwilioMessageError({
                          message: twilioMessage,
                        });

                      return (
                        <TableRow key={twilioMessage._id}>
                          <TableCell>{twilioMessage.from}</TableCell>
                          <TableCell>{twilioMessage.to}</TableCell>
                          <TableCell>{twilioMessage.contact?.name}</TableCell>
                          <TableCell>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="line-clamp-1 min-w-64 break-all whitespace-break-spaces">
                                  {twilioMessage.body}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="whitespace-break-spaces">
                                  {twilioMessage.body}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Badge>
                              <TwilioMessageStatusIcon
                                message={twilioMessage}
                              />
                              {twilioMessage.workflowStatus?.type} /{" "}
                              {twilioMessage.status}
                            </Badge>

                            {isError && (
                              <div className="text-destructive mt-2 text-xs">
                                <div>
                                  <a
                                    target="_blank"
                                    href={docsUrl}
                                    rel="noreferrer noopener"
                                    className="underline"
                                  >
                                    Error Code: {errorCode}
                                  </a>
                                </div>

                                <Tooltip>
                                  <TooltipTrigger className="text-destructive max-w-64 truncate">
                                    Error Message: {errorMessage}
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {errorMessage}
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {format(twilioMessage._creationTime, "PPPp")}
                          </TableCell>
                          <TableCell>
                            {format(
                              twilioMessage.lastUpdatedAt ??
                                twilioMessage._creationTime,
                              "PPPp",
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                <Button
                  className="mt-4 w-full"
                  variant="outline"
                  onClick={onLoadMore}
                  disabled={
                    twilioMessagesQuery.isLoading ||
                    twilioMessagesQuery.status === "Exhausted"
                  }
                >
                  {twilioMessagesQuery.isLoading && <Spinner />}
                  {twilioMessagesQuery.status === "Exhausted"
                    ? "No more outbound messages"
                    : "Load More"}
                </Button>
              </>
            )}
          </ItemContent>
        </Item>
      </ItemGroup>
    </div>
  );
}
