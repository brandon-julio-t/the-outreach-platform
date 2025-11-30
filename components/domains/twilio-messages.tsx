"use client";

import type { Doc } from "@/convex/_generated/dataModel";
import { CheckCheckIcon, CheckIcon, HourglassIcon, XIcon } from "lucide-react";

export const TwilioMessageStatusIcon = ({
  message,
}: {
  message: Doc<"twilioMessages">;
}) => {
  if (message.status === "read") {
    return <CheckCheckIcon className="text-success size-(--text-xs)" />;
  }
  if (message.status === "delivered" || message.status === "received") {
    return <CheckIcon className="text-info size-(--text-xs)" />;
  }
  if (message.status === "failed") {
    return <XIcon className="text-destructive size-(--text-xs)" />;
  }
  return <HourglassIcon className="text-warning size-(--text-xs)" />;
};
