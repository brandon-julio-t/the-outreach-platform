"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

export function EnsureOrganizationDialog() {
  const [open, setOpen] = React.useState(false);

  const currentOrganization = useQuery(
    api.domains.organizations.queries.getCurrentUserActiveOrganization,
  );

  React.useEffect(
    function openDialogIfNoOrganization() {
      if (currentOrganization === null) {
        setOpen(true);
      }
    },
    [currentOrganization],
  );

  const organizations = useQuery(
    api.domains.organizations.queries.getCurrentUserOrganizations,
  );

  const form = useForm({
    mode: "onTouched",
    resolver: zodResolver(
      z.object({
        organizationId: z.string().nonempty(),
      }),
    ),
    defaultValues: {
      organizationId: "",
    },
  });

  const setCurrentUserActiveOrganization = useMutation(
    api.domains.organizations.mutations.setCurrentUserActiveOrganization,
  );

  const onSubmit = form.handleSubmit(
    async (data) => {
      await toast
        .promise(
          setCurrentUserActiveOrganization({
            organizationId: data.organizationId as Id<"organizations">,
          }),
          {
            loading: "Setting your active organization...",
            success: "Active organization set successfully",
            error: "Failed to set active organization",
          },
        )
        .unwrap();

      setOpen(false);
    },
    (error) => {
      console.error(error);
      toast.error("Failed to submit form", {
        description: "Please check your form and try again.",
      });
    },
  );

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Choose Organization</AlertDialogTitle>
          <AlertDialogDescription>
            Please choose an organization to continue.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={onSubmit}>
          <FieldGroup>
            <Controller
              name="organizationId"
              control={form.control}
              render={({ field, fieldState }) => (
                <RadioGroup
                  {...field}
                  value={field.value}
                  onValueChange={(value) => {
                    console.log(value);
                    field.onChange(value as Id<"organizations">);
                  }}
                  aria-invalid={fieldState.invalid}
                >
                  {organizations === undefined ? (
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Spinner />
                        </EmptyMedia>
                        <EmptyTitle>Loading organizations...</EmptyTitle>
                        <EmptyDescription>
                          We are loading your organizations. Please wait a
                          moment.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  ) : organizations.length <= 0 ? (
                    <Empty className="border">
                      <EmptyHeader>
                        <EmptyTitle>No organizations found.</EmptyTitle>
                        <EmptyDescription>
                          You don&apos;t have any organizations yet. This should
                          not happen. Please contact support.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  ) : (
                    organizations.map((organization) => (
                      <FieldLabel
                        key={organization._id}
                        htmlFor={organization._id}
                        aria-invalid={fieldState.invalid}
                      >
                        <Field
                          orientation="horizontal"
                          data-invalid={fieldState.invalid}
                        >
                          <RadioGroupItem
                            id={organization._id}
                            value={organization._id}
                            aria-invalid={fieldState.invalid}
                          >
                            {organization.name}
                          </RadioGroupItem>
                          <FieldContent>
                            <FieldTitle>{organization.name}</FieldTitle>
                          </FieldContent>
                        </Field>
                      </FieldLabel>
                    ))
                  )}
                </RadioGroup>
              )}
            />

            <AlertDialogFooter>
              <Button
                type="submit"
                className="ml-auto"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting && <Spinner />}
                Continue
              </Button>
            </AlertDialogFooter>
          </FieldGroup>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
