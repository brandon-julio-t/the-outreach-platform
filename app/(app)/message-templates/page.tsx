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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import { usePaginatedQuery, useQuery } from "convex-helpers/react/cache/hooks";
import Link from "next/link";
import { MessageTemplateTableRow } from "./_components/message-template-table-row";

export default function MessageTemplatesPage() {
  const currentOrganization = useQuery(
    api.domains.organizations.queries.getCurrentUserActiveOrganization,
  );

  const query = usePaginatedQuery(
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
    if (query.status === "CanLoadMore") {
      query.loadMore(100);
    }
  };

  return (
    <div className="container mx-auto">
      <ItemGroup>
        <Item>
          <ItemContent>
            <ItemTitle>Message Templates</ItemTitle>
            <ItemDescription>
              Message templates for your outreach campaigns.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button asChild>
              <Link href="/message-templates/create">Add Message Template</Link>
            </Button>
          </ItemActions>
        </Item>

        <Item>
          <ItemContent className="w-full">
            {query.status === "LoadingFirstPage" ? (
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
            ) : query.results.length === 0 ? (
              <Empty className="border">
                <EmptyHeader>
                  <EmptyTitle>No message templates found.</EmptyTitle>
                  <EmptyDescription>
                    You don&apos;t have any message templates yet. You can add a
                    new message template by clicking the button below.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button asChild>
                    <Link href="/message-templates/create">
                      Add Message Template
                    </Link>
                  </Button>
                </EmptyContent>
              </Empty>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>WhatsApp Status</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="w-1">&nbsp;</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {query.results.map((messageTemplate) => (
                      <MessageTemplateTableRow
                        key={messageTemplate._id}
                        messageTemplate={messageTemplate}
                      />
                    ))}
                  </TableBody>
                </Table>

                <Button
                  className="mt-4 w-full"
                  variant="outline"
                  onClick={onLoadMore}
                  disabled={query.isLoading || query.status === "Exhausted"}
                >
                  {query.isLoading && <Spinner />}
                  {query.status === "Exhausted"
                    ? "No more message templates"
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
