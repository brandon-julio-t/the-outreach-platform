import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/convex/_generated/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { RightSidebarContactData } from "./types";

export function ContactGoalInformation({
  contact,
}: {
  contact: RightSidebarContactData;
}) {
  const form = useForm({
    mode: "onTouched",
    resolver: zodResolver(
      z.object({
        note: z.string().trim().nonempty(),
      }),
    ),
    values: {
      note: contact.goalsAchievedNote ?? "",
    },
  });

  const patchContact = useMutation(api.domains.contacts.mutations.patchContact);

  const onSubmit = form.handleSubmit(
    async (data) => {
      await toast
        .promise(
          patchContact({
            id: contact._id,
            patch: { goalsAchievedNote: data.note },
          }),
          {
            loading: "Updating contact goal information...",
            success: "Contact goal information updated successfully",
            error: "Failed to update contact goal information",
          },
        )
        .unwrap();
    },
    (error) => {
      console.error(error);
      toast.error("Failed to update contact goal information", {
        description: "Please check your form and try again.",
      });
    },
  );

  return (
    <form onSubmit={onSubmit}>
      <Controller
        name="note"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <InputGroup>
              <InputGroupTextarea
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                className="max-h-56"
              />

              <InputGroupAddon align="block-start">
                <InputGroupText>
                  <FieldLabel htmlFor={field.name}>
                    Contact Goal Information
                  </FieldLabel>
                </InputGroupText>
              </InputGroupAddon>

              <InputGroupAddon align="block-end">
                <InputGroupButton
                  type="submit"
                  variant="default"
                  className="ml-auto"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting && <Spinner />}
                  Save
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </Field>
        )}
      />
    </form>
  );
}
