import { PhoneInput } from "@/components/phone-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import type { Doc } from "@/convex/_generated/dataModel";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const editContactSchema = z.object({
  name: z.string().nonempty(),
  phone: z.string().nonempty(),
});

export function EditContactDialog({
  contact,
  children,
  open,
  setOpen,
}: {
  contact: Doc<"contacts">;
  children?: React.ReactNode;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Contact</DialogTitle>
          <DialogDescription>Edit the contact details.</DialogDescription>
        </DialogHeader>
        <DialogBody setOpen={setOpen} contact={contact} />
      </DialogContent>
    </Dialog>
  );
}

function DialogBody({
  setOpen,
  contact,
}: {
  contact: Doc<"contacts">;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const form = useForm<z.infer<typeof editContactSchema>>({
    mode: "onTouched",
    resolver: zodResolver(editContactSchema),
    defaultValues: {
      name: contact.name,
      phone: contact.phone,
    },
  });

  const patchContact = useMutation(api.domains.contacts.mutations.patchContact);

  const onSubmit = form.handleSubmit(
    async (data) => {
      await toast
        .promise(patchContact({ id: contact._id, patch: data }), {
          loading: "Updating contact...",
          success: "Contact updated successfully",
          error: "Failed to update contact",
        })
        .unwrap();

      setOpen(false);
    },
    (error) => {
      console.error(error);
      toast.error("Failed to update contact", {
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
          name="phone"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Phone</FieldLabel>
              <PhoneInput {...field} id={field.name} type="tel" />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Field orientation="horizontal">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={form.formState.isSubmitting}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && <Spinner />}
            Update Contact
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
