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
import { ItemGroup } from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/convex/_generated/api";
import { usePaginatedQuery, useQuery } from "convex-helpers/react/cache/hooks";
import { SearchIcon, XIcon } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { parseAsString, useQueryState } from "nuqs";
import { useDebounceValue } from "usehooks-ts";
import { ContactsLeftSidebarItem } from "./contacts-left-sidebar-item";

export function ContactsLeftSidebar() {
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );

  const [debouncedSearch] = useDebounceValue(search, 200);

  const currentOrganization = useQuery(
    api.domains.organizations.queries.getCurrentUserActiveOrganization,
  );

  const contactsQuery = usePaginatedQuery(
    api.domains.contacts.queries.getContactsForChatPage,
    currentOrganization?._id
      ? {
          search: debouncedSearch,
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

  return (
    <div className="flex h-(--page-height) flex-col">
      <div className="border-b p-1">
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
              <InputGroupButton size="icon-xs" onClick={() => setSearch("")}>
                <XIcon />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>
      </div>

      <ItemGroup className="flex-1 overflow-y-auto p-1">
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
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No contacts found.</EmptyTitle>
              <EmptyDescription>
                You don&apos;t have any contacts yet. You can add a new contact
                by going to the contacts page.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild>
                <Link href="/contacts">Go to contacts</Link>
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <>
            {contactsQuery.results.map((contact) => (
              <ContactsLeftSidebarItem key={contact._id} contact={contact} />
            ))}

            <Button
              variant="outline"
              onClick={onLoadMore}
              disabled={
                contactsQuery.isLoading || contactsQuery.status === "Exhausted"
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
      </ItemGroup>
    </div>
  );
}
