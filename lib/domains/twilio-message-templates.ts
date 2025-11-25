import { Badge } from "@/components/ui/badge";
import React from "react";

type BadgeVariant = React.ComponentProps<typeof Badge>["variant"];

export const getWhatsAppApprovalStatusBadgeVariant = (
  status?: "pending" | "received" | "approved" | "rejected" | "error",
): BadgeVariant => {
  switch (status) {
    case "approved":
      return "default";
    case "pending":
    case "received":
      return "secondary";
    case "rejected":
    case "error":
      return "destructive";
    default:
      return "outline";
  }
};
