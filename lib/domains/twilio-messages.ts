import type { Badge } from "@/components/ui/badge";
import type { Doc } from "@/convex/_generated/dataModel";
import type React from "react";

type BadgeVariant = React.ComponentProps<typeof Badge>["variant"];

export const getTwilioMessageCategoryBadgeVariant = (
  category: "marketing" | "utility",
): BadgeVariant => {
  switch (category) {
    case "marketing":
      return "default";
    case "utility":
      return "secondary";
    default:
      return "outline";
  }
};

export const getTwilioMessageError = ({
  message,
}: {
  message: Doc<"twilioMessages">;
}) => {
  const isError =
    message.errorCode || message.errorMessage || message.status === "failed";

  const errorMessage =
    message.errorMessage ||
    "The message could not be sent. This can happen for various reasons including queue overflows, account suspensions and media errors (in the case of MMS).";

  return {
    isError: !!isError,
    errorCode: isError ? message.errorCode : undefined,
    errorMessage: isError ? errorMessage : undefined,
    docsUrl: isError
      ? `https://www.twilio.com/docs/api/errors/${message.errorCode}`
      : undefined,
  };
};
