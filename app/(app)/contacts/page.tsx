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
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
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
import { usePaginatedQuery } from "convex-helpers/react/cache/hooks";
import { SearchIcon, XIcon } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useDebounceValue } from "usehooks-ts";
import { AddContactDialog } from "./_components/add-contact-dialog";
import { ContactsTableRow } from "./_components/contacts-table-row";

const ContactsPage = () => {
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );

  const [debouncedSearch] = useDebounceValue(search, 200);

  const contactsQuery = usePaginatedQuery(
    api.domains.contacts.queries.getContacts,
    {
      search: debouncedSearch,
    },
    {
      initialNumItems: 50,
    },
  );

  const onLoadMore = () => {
    if (contactsQuery.status === "CanLoadMore") {
      contactsQuery.loadMore(100);
    }
  };

  return (
    <main className="container mx-auto">
      <ItemGroup>
        <Item>
          <ItemContent>
            <ItemTitle>Contacts</ItemTitle>
            <ItemDescription>
              Contacts list for your outreach campaigns.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <AddContactDialog>
              <Button>Add Contact</Button>
            </AddContactDialog>
          </ItemActions>
        </Item>

        <Item>
          <ItemContent>
            <InputGroup>
              <InputGroupInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search contacts"
              />
              <InputGroupAddon>
                {contactsQuery.isLoading ? <Spinner /> : <SearchIcon />}
              </InputGroupAddon>
              {search && (
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    size="icon-xs"
                    onClick={() => setSearch("")}
                  >
                    <XIcon />
                  </InputGroupButton>
                </InputGroupAddon>
              )}
            </InputGroup>
          </ItemContent>
        </Item>

        <Item>
          <ItemContent className="w-full">
            {contactsQuery.isLoading ? (
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
                  <EmptyMedia variant="icon">
                    <SearchIcon />
                  </EmptyMedia>
                  <EmptyTitle>No contacts found.</EmptyTitle>
                  <EmptyDescription>
                    You don&apos;t have any contacts yet. You can add a new
                    contact by clicking the button below.
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
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="w-1">&nbsp;</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contactsQuery.results.map((contact) => (
                      <ContactsTableRow key={contact._id} contact={contact} />
                    ))}
                  </TableBody>
                </Table>

                <Button
                  className="mt-4 w-full"
                  variant="outline"
                  onClick={onLoadMore}
                  disabled={
                    contactsQuery.isLoading ||
                    contactsQuery.status === "Exhausted"
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
      </ItemGroup>
    </main>
  );
};

export default ContactsPage;
