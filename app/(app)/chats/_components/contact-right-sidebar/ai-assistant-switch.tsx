import {
  Field,
  FieldContent,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { BotIcon, BotOffIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { RightSidebarContactData } from "./types";

export function AiAssistantSwitch({
  contact,
}: {
  contact: RightSidebarContactData;
}) {
  const isAiAssistantDisabled = !!contact.aiAssistantDisabledTime;

  const [isLoading, setIsLoading] = React.useState(false);

  const patchContact = useMutation(api.domains.contacts.mutations.patchContact);

  return (
    <FieldLabel>
      <Field orientation="horizontal">
        {isLoading ? (
          <Spinner />
        ) : isAiAssistantDisabled ? (
          <BotOffIcon className="size-4" />
        ) : (
          <BotIcon className="size-4" />
        )}

        <FieldContent>
          <FieldTitle>
            AI {isAiAssistantDisabled ? "Disabled" : "Enabled"}
          </FieldTitle>
        </FieldContent>

        <Switch
          disabled={isLoading}
          checked={!isAiAssistantDisabled}
          onCheckedChange={async (checked) => {
            setIsLoading(true);

            await toast
              .promise(
                patchContact({
                  id: contact._id,
                  patch: {
                    aiAssistantDisabledTime: checked ? null : Date.now(),
                  },
                }),
                {
                  loading: checked
                    ? "Enabling AI assistant..."
                    : "Disabling AI assistant...",
                  success: checked
                    ? "AI assistant enabled successfully"
                    : "AI assistant disabled successfully",
                  error: checked
                    ? "Failed to enable AI assistant"
                    : "Failed to disable AI assistant",
                },
              )
              .unwrap();

            setIsLoading(false);
          }}
        />
      </Field>
    </FieldLabel>
  );
}
