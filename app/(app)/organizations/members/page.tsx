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
import { usePaginatedQuery } from "convex-helpers/react/cache/hooks";
import { AddMemberDialog } from "./_components/add-member-dialog";
import { MemberTableRow } from "./_components/member-table-row";

export default function OrganizationMembersPage() {
  const organizationMembersQuery = usePaginatedQuery(
    api.domains.organizationMembers.queries.getOrganizationMembers,
    {},
    {
      initialNumItems: 50,
    },
  );

  const onLoadMore = () => {
    if (organizationMembersQuery.status === "CanLoadMore") {
      organizationMembersQuery.loadMore(100);
    }
  };

  return (
    <main className="container mx-auto">
      <ItemGroup>
        <Item>
          <ItemContent>
            <ItemTitle>Organization Members</ItemTitle>
            <ItemDescription>List of organization members.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <AddMemberDialog>
              <Button>Add Member</Button>
            </AddMemberDialog>
          </ItemActions>
        </Item>

        <Item>
          <ItemContent className="w-full">
            {organizationMembersQuery.status === "LoadingFirstPage" ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Spinner />
                  </EmptyMedia>
                  <EmptyTitle>Loading members...</EmptyTitle>
                  <EmptyDescription>
                    We are loading the members of your organization. Please wait
                    a moment.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : organizationMembersQuery.results.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>No members found.</EmptyTitle>
                  <EmptyDescription>
                    You don&apos;t have any members in your organization yet.
                    You can add a new member by clicking the button below.
                  </EmptyDescription>
                  <EmptyContent>
                    <AddMemberDialog>
                      <Button>Add Member</Button>
                    </AddMemberDialog>
                  </EmptyContent>
                </EmptyHeader>
              </Empty>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="w-1">&nbsp;</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organizationMembersQuery.results.map((member) => (
                      <MemberTableRow key={member._id} member={member} />
                    ))}
                  </TableBody>
                </Table>

                <Button
                  className="mt-4 w-full"
                  variant="outline"
                  onClick={onLoadMore}
                  disabled={
                    organizationMembersQuery.isLoading ||
                    organizationMembersQuery.status === "Exhausted"
                  }
                >
                  {organizationMembersQuery.isLoading && <Spinner />}
                  {organizationMembersQuery.status === "Exhausted"
                    ? "No more members"
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
