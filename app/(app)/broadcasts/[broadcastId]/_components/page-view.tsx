"use client";

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
  ItemHeader,
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
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { usePaginatedQuery, useQuery } from "convex-helpers/react/cache/hooks";
import { format } from "date-fns";
import { ArrowLeftIcon } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

export default function BroadcastDetailsPageView({
  broadcastId,
}: {
  broadcastId: Id<"twilioMessageBroadcasts">;
}) {
  const currentOrganization = useQuery(
    api.domains.organizations.queries.getCurrentUserActiveOrganization,
  );

  const twilioMessageBroadcastQuery = usePaginatedQuery(
    api.domains.twilioMessages.queries.getTwilioMessagesByBroadcastId,
    currentOrganization?._id
      ? {
          organizationId: currentOrganization._id,
          twilioMessageBroadcastId: broadcastId,
        }
      : "skip",
    {
      initialNumItems: 50,
    },
  );

  const onLoadMore = () => {
    if (twilioMessageBroadcastQuery.status === "CanLoadMore") {
      twilioMessageBroadcastQuery.loadMore(100);
    }
  };

  return (
    <div className="container mx-auto">
      <ItemGroup>
        <Item>
          <ItemHeader>
            <Button variant="ghost" asChild>
              <Link href="/broadcasts">
                <ArrowLeftIcon /> Back to broadcasts
              </Link>
            </Button>
          </ItemHeader>
          <ItemContent>
            <ItemTitle>Broadcast Details</ItemTitle>
            <ItemDescription>
              View the details of the broadcast.
            </ItemDescription>
          </ItemContent>
        </Item>

        <Item>
          <ItemContent className="w-full">
            {twilioMessageBroadcastQuery.status === "LoadingFirstPage" ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Spinner />
                  </EmptyMedia>
                  <EmptyTitle>Loading broadcast details...</EmptyTitle>
                  <EmptyDescription>
                    We are loading the details of the broadcast. Please wait a
                    moment.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : twilioMessageBroadcastQuery.results.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>No messages found.</EmptyTitle>
                  <EmptyDescription>
                    No messages found for this broadcast.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contact</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Last Updated At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {twilioMessageBroadcastQuery.results.map((message) => (
                      <TableRow key={message._id}>
                        <TableCell>
                          <div>{message.contact?.name}</div>
                          <div className="text-muted-foreground">
                            {message.contact?.phone}
                          </div>
                        </TableCell>
                        <TableCell>{message.body}</TableCell>
                        <TableCell>{message.status}</TableCell>
                        <TableCell>
                          {format(message._creationTime, "PPPp")}
                        </TableCell>
                        <TableCell>
                          {format(
                            message.lastUpdatedAt ?? message._creationTime,
                            "PPPp",
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Button
                  onClick={onLoadMore}
                  disabled={
                    twilioMessageBroadcastQuery.isLoading ||
                    twilioMessageBroadcastQuery.status === "Exhausted"
                  }
                  className="mt-4 w-full"
                  variant="outline"
                  asChild
                >
                  <motion.button onViewportEnter={onLoadMore}>
                    {twilioMessageBroadcastQuery.isLoading && <Spinner />}
                    {twilioMessageBroadcastQuery.status === "Exhausted"
                      ? "No more messages"
                      : "Load More"}
                  </motion.button>
                </Button>
              </>
            )}
          </ItemContent>
        </Item>
      </ItemGroup>
    </div>
  );
}
