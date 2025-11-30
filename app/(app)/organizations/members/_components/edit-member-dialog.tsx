import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/convex/_generated/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import type { RowData } from "./types";

export function EditMemberDialog({
  member,
  open,
  setOpen,
}: {
  member: RowData;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Member</DialogTitle>
          <DialogDescription>
            Edit the member&apos;s information.
          </DialogDescription>
        </DialogHeader>

        <DialogBody member={member} setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}

function DialogBody({
  member,
  setOpen,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  member: RowData;
}) {
  const form = useForm({
    mode: "onTouched",
    resolver: zodResolver(
      z.object({
        email: z.email().nonempty(),
        name: z.string().nonempty(),
      }),
    ),
    defaultValues: {
      email: member.user?.email ?? "",
      name: member.user?.name ?? "",
    },
  });

  const patchOrganizationMemberMutation = useMutation(
    api.domains.organizationMembers.mutations.patchOrganizationMember,
  );

  const onSubmit = form.handleSubmit(
    async (data) => {
      await toast
        .promise(
          patchOrganizationMemberMutation({ id: member._id, patch: data }),
          {
            loading: "Updating member...",
            success: "Member updated successfully",
            error: (error) => {
              return {
                message: "Failed to update member",
                description:
                  error instanceof ConvexError
                    ? error.data
                    : "Please check your form and try again.",
              };
            },
          },
        )
        .unwrap();

      setOpen(false);
    },
    (error) => {
      console.error(error);
      toast.error("Failed to update member", {
        description: "Please check your form and try again.",
      });
    },
  );

  return (
    <form onSubmit={onSubmit}>
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Name</FieldLabel>
              <Input {...field} id={field.name} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Email</FieldLabel>
              <Input {...field} id={field.name} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Field orientation="horizontal">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => setOpen(false)}
            disabled={form.formState.isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && <Spinner />}
            Update Member
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
