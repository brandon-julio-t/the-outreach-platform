"use client";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemActions,
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
import { api } from "@/convex/_generated/api";
import { usePaginatedQuery, useQuery } from "convex-helpers/react/cache/hooks";
import { format } from "date-fns";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

export default function BroadcastsPage() {
  const currentOrganization = useQuery(
    api.domains.organizations.queries.getCurrentUserActiveOrganization,
  );

  const twilioMessageBroadcastsQuery = usePaginatedQuery(
    api.domains.twilioMessageBroadcasts.queries.getTwilioMessageBroadcasts,
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
    if (twilioMessageBroadcastsQuery.status === "CanLoadMore") {
      twilioMessageBroadcastsQuery.loadMore(100);
    }
  };

  return (
    <div className="container mx-auto">
      <ItemGroup>
        <Item>
          <ItemContent>
            <ItemTitle>Broadcasts</ItemTitle>
            <ItemDescription>
              Broadcasts for your outreach campaigns.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button asChild>
              <Link href="/broadcasts/create">Create Broadcast</Link>
            </Button>
          </ItemActions>
        </Item>

        <Item>
          <ItemContent className="w-full">
            {twilioMessageBroadcastsQuery.status === "LoadingFirstPage" ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Spinner />
                  </EmptyMedia>
                  <EmptyTitle>Loading broadcasts...</EmptyTitle>
                  <EmptyDescription>
                    We are loading your broadcasts. Please wait a moment.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : twilioMessageBroadcastsQuery.results.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>No broadcasts found.</EmptyTitle>
                  <EmptyDescription>
                    You don&apos;t have any broadcasts yet. You can create a new
                    broadcast by clicking the button below.
                  </EmptyDescription>
                  <EmptyContent>
                    <Button asChild>
                      <Link href="/broadcasts/create">Create Broadcast</Link>
                    </Button>
                  </EmptyContent>
                </EmptyHeader>
              </Empty>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Message Template Name</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead className="w-1">&nbsp;</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {twilioMessageBroadcastsQuery.results.map((broadcast) => (
                      <TableRow key={broadcast._id}>
                        <TableCell>
                          {broadcast.twilioMessageTemplate?.name}
                        </TableCell>
                        <TableCell>
                          {format(broadcast._creationTime, "PPPpp")}
                        </TableCell>
                        <TableCell>{broadcast.user?.name}</TableCell>
                        <TableCell>
                          <Button variant="ghost" asChild>
                            <Link href={`/broadcasts/${broadcast._id}`}>
                              View Details <ArrowRightIcon />
                            </Link>
                          </Button>
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
                    twilioMessageBroadcastsQuery.isLoading ||
                    twilioMessageBroadcastsQuery.status === "Exhausted"
                  }
                >
                  {twilioMessageBroadcastsQuery.isLoading && <Spinner />}
                  {twilioMessageBroadcastsQuery.status === "Exhausted"
                    ? "No more broadcasts"
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
