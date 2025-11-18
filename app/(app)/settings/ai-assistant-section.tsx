import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { useMutation } from "convex/react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

export function AiAssistantSection() {
  const currentOrganization = useQuery(
    api.domains.organizations.queries.getCurrentUserActiveOrganization,
  );

  const aiAssistantSettings = useQuery(
    api.domains.aiAssistantSettings.queries.getActiveOrgAiAssistantSettings,
    currentOrganization?._id
      ? {
          organizationId: currentOrganization._id,
        }
      : "skip",
  );

  const form = useForm({
    mode: "onTouched",
    resolver: zodResolver(
      z.object({
        modelId: z.enum(["gpt-5.1"]),
        systemPrompt: z.string().nonempty(),
      }),
    ),
    values: {
      modelId: aiAssistantSettings?.modelId ?? "gpt-5.1",
      systemPrompt: aiAssistantSettings?.systemPrompt ?? "",
    },
  });

  const upsertAiAssistantSettings = useMutation(
    api.domains.aiAssistantSettings.mutations.upsertAiAssistantSettings,
  );

  const onSubmit = form.handleSubmit(
    async (data) => {
      await toast
        .promise(upsertAiAssistantSettings(data), {
          loading: "Updating AI assistant settings...",
          success: "AI assistant settings updated successfully",
          error: "Failed to update AI assistant settings",
        })
        .unwrap();
    },
    (error) => {
      console.error(error);
      toast.error("Failed to update AI assistant settings", {
        description: "Please check your form and try again.",
      });
    },
  );

  return (
    <Item variant="outline" className="mx-4">
      <ItemContent>
        <ItemTitle>AI Assistant</ItemTitle>
        <ItemDescription>Configure your AI assistant settings.</ItemDescription>
      </ItemContent>
      <ItemContent className="w-full">
        <form onSubmit={onSubmit}>
          <FieldGroup>
            <Controller
              name="modelId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Model ID</FieldLabel>
                  <Select {...field}>
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-5.1">GPT-5.1</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="systemPrompt"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>System Prompt</FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    rows={7}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Field orientation="horizontal">
              <Button
                type="submit"
                className="ml-auto"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting && <Spinner />}
                Save Settings
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </ItemContent>
    </Item>
  );
}
