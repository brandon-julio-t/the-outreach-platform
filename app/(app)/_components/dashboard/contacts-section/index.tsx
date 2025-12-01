"use client";

import { Item, ItemContent, ItemHeader, ItemTitle } from "@/components/ui/item";

import { BadgePill, BadgePillDot } from "@/components/catalyst-ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import { type contactFilterTypes } from "@/convex/domains/contacts/configs";
import { usePaginatedQuery, useQuery } from "convex-helpers/react/cache/hooks";
import { AddContactDialog } from "../../../contacts/_components/add-contact-dialog";
import { DashboardContactTableRow } from "./contact-table-row";

export function DashboardContactsSection({
  filterType,
}: {
  filterType: (typeof contactFilterTypes)[number];
}) {
  const currentOrganization = useQuery(
    api.domains.organizations.queries.getCurrentUserActiveOrganization,
  );

  const contactsQuery = usePaginatedQuery(
    api.domains.contacts.queries.getContacts,
    currentOrganization?._id
      ? {
          filterType,
          organizationId: currentOrganization._id,
        }
      : "skip",
    {
      initialNumItems: 5,
    },
  );

  const onLoadMore = () => {
    if (contactsQuery.status === "CanLoadMore") {
      contactsQuery.loadMore(10);
    }
  };

  return (
    <Item>
      <ItemHeader>
        <ItemTitle>
          <span>Contacts</span>

          {filterType === "in_progress" && (
            <BadgePillDot color="yellow" size="sm">
              In Progress
            </BadgePillDot>
          )}

          {filterType === "goals_achieved" && (
            <BadgePill color="green" size="sm">
              Goals Achieved
            </BadgePill>
          )}

          {filterType === "ai_assistant_disabled" && (
            <BadgePillDot color="red" size="sm">
              AI Assistant Disabled
            </BadgePillDot>
          )}
        </ItemTitle>
      </ItemHeader>

      <ItemContent className="w-full">
        {contactsQuery.status === "LoadingFirstPage" ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Spinner />
              </EmptyMedia>
              <EmptyTitle>Loading contacts...</EmptyTitle>
              <EmptyDescription>
                We are loading your contacts. Please wait a moment.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : contactsQuery.results.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyTitle>No contacts found.</EmptyTitle>
              <EmptyDescription>
                You don&apos;t have any contacts yet. You can add a new contact
                by clicking the button below.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <AddContactDialog>
                <Button>Add Contact</Button>
              </AddContactDialog>
            </EmptyContent>
          </Empty>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell className="text-muted-foreground">Name</TableCell>

                  {filterType === "goals_achieved" && (
                    <TableCell className="text-muted-foreground">
                      Goals Achieved Note
                    </TableCell>
                  )}

                  {filterType === "ai_assistant_disabled" && (
                    <TableCell className="text-muted-foreground">
                      AI Assistant Disabled Reason
                    </TableCell>
                  )}

                  {filterType === "in_progress" && (
                    <TableCell className="text-muted-foreground">
                      Last Chat
                    </TableCell>
                  )}

                  <TableCell className="w-1">&nbsp;</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contactsQuery.results.map((contact) => (
                  <DashboardContactTableRow
                    key={contact._id}
                    contact={contact}
                    filterType={filterType}
                  />
                ))}
              </TableBody>
            </Table>

            <Button
              className="mt-4 w-full"
              variant="outline"
              onClick={onLoadMore}
              disabled={
                contactsQuery.isLoading || contactsQuery.status === "Exhausted"
              }
            >
              {contactsQuery.isLoading && <Spinner />}
              {contactsQuery.status === "Exhausted"
                ? "No more contacts"
                : "Load More"}
            </Button>
          </>
        )}
      </ItemContent>
    </Item>
  );
}
