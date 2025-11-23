"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

export function EnsureOrganizationDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentOrganization = useQuery(
    api.domains.organizations.queries.getCurrentUserActiveOrganization,
  );

  if (currentOrganization === undefined) {
    return (
      <div className="bg-muted grid min-h-svh place-items-center">
        <Empty className="bg-background">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Spinner />
            </EmptyMedia>
            <EmptyTitle>Setting up your app...</EmptyTitle>
            <EmptyDescription>
              Please wait while we set up your app.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  if (currentOrganization === null) {
    return <ChooseOrganization />;
  }

  return children;
}

function ChooseOrganization() {
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
    },
    (error) => {
      console.error(error);
      toast.error("Failed to submit form", {
        description: "Please check your form and try again.",
      });
    },
  );

  return (
    <main className="bg-muted grid min-h-svh place-items-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Choose your organization</CardTitle>
          <CardDescription>
            Select the organization you want to use to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                      <Spinner />
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

              <Field orientation="horizontal">
                <Button
                  type="submit"
                  className="ml-auto"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting && <Spinner />}
                  Continue
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
