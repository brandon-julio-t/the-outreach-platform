"use client";

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
import { usePaginatedQuery } from "convex-helpers/react/cache/hooks";
import { format } from "date-fns";

export default function OutboundMessagesPage() {
  const twilioMessagesQuery = usePaginatedQuery(
    api.domains.twilioMessages.queries.getTwilioMessages,
    {},
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
    <main className="container mx-auto">
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
                      <TableHead>Body</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Updated At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {twilioMessagesQuery.results.map((twilioMessage) => (
                      <TableRow key={twilioMessage._id}>
                        <TableCell>{twilioMessage.from}</TableCell>
                        <TableCell>
                          <div>{twilioMessage.to}</div>

                          {twilioMessage.contact && (
                            <div className="text-muted-foreground text-sm">
                              {twilioMessage.contact.name}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="line-clamp-2 whitespace-break-spaces">
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
                          <Badge>{twilioMessage.status}</Badge>

                          {twilioMessage.errorCode && (
                            <div className="text-destructive">
                              Error Code: {twilioMessage.errorCode}
                            </div>
                          )}

                          {twilioMessage.errorMessage && (
                            <div className="text-destructive">
                              Error Message: {twilioMessage.errorMessage}
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
                    ))}
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
    </main>
  );
}
