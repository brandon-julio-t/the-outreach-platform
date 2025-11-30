"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/convex/_generated/api";
import { usePaginatedQuery, useQuery } from "convex-helpers/react/cache/hooks";
import { SearchIcon, XIcon } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import React from "react";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import { useDebounceValue } from "usehooks-ts";
import type { CreateBroadcastFormSchema } from "../schemas";

export function ChooseContactsTabContent({
  form,
}: {
  form: UseFormReturn<CreateBroadcastFormSchema>;
}) {
  const currentOrganization = useQuery(
    api.domains.organizations.queries.getCurrentUserActiveOrganization,
  );

  const [search, setSearch] = React.useState("");

  const [debouncedSearch] = useDebounceValue(search, 200);

  const contactsQuery = usePaginatedQuery(
    api.domains.contacts.queries.getContacts,
    currentOrganization?._id
      ? {
          organizationId: currentOrganization._id,
          search: debouncedSearch,
        }
      : "skip",
    {
      initialNumItems: 50,
    },
  );

  const onLoadMoreContacts = () => {
    if (contactsQuery.status === "CanLoadMore") {
      contactsQuery.loadMore(100);
    }
  };

  return (
    <FieldGroup>
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
              You don&apos;t have any contacts yet. You can add a new contact by
              clicking the button below.
            </EmptyDescription>
            <EmptyContent>
              <Button asChild>
                <Link href="/contacts">Add Contact</Link>
              </Button>
            </EmptyContent>
          </EmptyHeader>
        </Empty>
      ) : (
        <Controller
          name="contacts"
          control={form.control}
          render={({ field, fieldState }) => {
            const areAllSelected =
              contactsQuery.results.length === field.value.length;

            return (
              <>
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="bg-transparent!">
                    <Checkbox
                      aria-invalid={fieldState.invalid}
                      checked={areAllSelected}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          field.onChange(
                            contactsQuery.results.map((contact) => ({
                              id: contact._id,
                              phone: contact.phone,
                            })),
                          );
                        } else {
                          field.onChange([]);
                        }
                      }}
                    />
                    <FieldTitle>
                      Choose all ({Number(field.value.length)} selected)
                    </FieldTitle>
                  </FieldLabel>
                </Field>

                <Field className="max-h-96 overflow-y-auto">
                  {contactsQuery.results.map((contact) => {
                    const index = field.value.findIndex(
                      (c) => c.id === contact._id,
                    );
                    const isSelected = index !== -1;

                    return (
                      <FieldLabel
                        key={contact._id}
                        htmlFor={contact._id}
                        aria-invalid={fieldState.invalid}
                      >
                        <Field
                          orientation="horizontal"
                          data-invalid={fieldState.invalid}
                        >
                          <Checkbox
                            id={contact._id}
                            aria-invalid={fieldState.invalid}
                            value={contact._id}
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([
                                  ...field.value,
                                  {
                                    id: contact._id,
                                    phone: contact.phone,
                                  },
                                ]);
                              } else {
                                const clone = [...field.value];
                                clone.splice(index, 1);
                                field.onChange(clone);
                              }
                            }}
                          />

                          <FieldContent>
                            <FieldTitle>{contact.name}</FieldTitle>

                            <FieldDescription className="line-clamp-2">
                              {contact.phone}
                            </FieldDescription>
                          </FieldContent>
                        </Field>
                      </FieldLabel>
                    );
                  })}

                  <Button
                    variant="outline"
                    disabled={
                      contactsQuery.isLoading ||
                      contactsQuery.status === "Exhausted"
                    }
                    onClick={onLoadMoreContacts}
                    asChild
                  >
                    <motion.button onViewportEnter={onLoadMoreContacts}>
                      {contactsQuery.isLoading && <Spinner />}
                      {contactsQuery.status === "Exhausted"
                        ? "No more contacts"
                        : "Load More"}
                    </motion.button>
                  </Button>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              </>
            );
          }}
        />
      )}
    </FieldGroup>
  );
}
