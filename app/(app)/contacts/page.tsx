"use client";

import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import {
  contactFilterTypeUiLabels,
  contactFilterTypes,
} from "@/convex/domains/contacts/configs";
import { usePaginatedQuery, useQuery } from "convex-helpers/react/cache/hooks";
import { ChevronDownIcon, DownloadIcon, SearchIcon, XIcon } from "lucide-react";
import { motion } from "motion/react";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import React from "react";
import { useDebounceValue } from "usehooks-ts";
import { AddContactDialog } from "./_components/add-contact-dialog";
import { ContactsTableRow } from "./_components/contacts-table-row";
import { ImportContactsDrawer } from "./_components/import-contacts-drawer";

const ContactsPage = () => {
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );

  const [debouncedSearch] = useDebounceValue(search, 200);

  const [filterType, setFilterType] = useQueryState(
    "filterType",
    parseAsStringLiteral(contactFilterTypes).withDefault("all"),
  );

  const currentOrganization = useQuery(
    api.domains.organizations.queries.getCurrentUserActiveOrganization,
  );

  const contactsQuery = usePaginatedQuery(
    api.domains.contacts.queries.getContacts,
    currentOrganization?._id
      ? {
          search: debouncedSearch,
          filterType,
          organizationId: currentOrganization._id,
        }
      : "skip",
    {
      initialNumItems: 50,
    },
  );

  const onLoadMore = () => {
    if (contactsQuery.status === "CanLoadMore") {
      contactsQuery.loadMore(100);
    }
  };

  const [openImportContacts, setOpenImportContacts] = React.useState(false);

  return (
    <div className="container mx-auto">
      <ItemGroup>
        <Item>
          <ItemContent>
            <ItemTitle>Contacts</ItemTitle>
            <ItemDescription>
              Contacts list for your outreach campaigns.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <ButtonGroup>
              <AddContactDialog>
                <Button>Add Contact</Button>
              </AddContactDialog>

              <ButtonGroupSeparator />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" className="group">
                    <ChevronDownIcon className="transition-transform group-data-[state=open]:rotate-180" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setOpenImportContacts(true)}>
                    <DownloadIcon />
                    Import contacts
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </ButtonGroup>

            <ImportContactsDrawer
              open={openImportContacts}
              setOpen={setOpenImportContacts}
            />
          </ItemActions>
        </Item>

        <Item>
          <ItemContent className="w-full">
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

          <ItemContent className="w-full">
            <Tabs
              value={filterType}
              onValueChange={(value) =>
                setFilterType(value as typeof filterType)
              }
              className="overflow-x-auto"
            >
              <TabsList>
                {contactFilterTypes.map((type) => (
                  <TabsTrigger key={type} value={type} className="capitalize">
                    {contactFilterTypeUiLabels[type]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </ItemContent>
        </Item>

        <Item>
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
                      <TableHead>Status</TableHead>
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
                  asChild
                >
                  <motion.button onViewportEnter={onLoadMore}>
                    {contactsQuery.isLoading && <Spinner />}
                    {contactsQuery.status === "Exhausted"
                      ? "No more contacts"
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
};

export default ContactsPage;
