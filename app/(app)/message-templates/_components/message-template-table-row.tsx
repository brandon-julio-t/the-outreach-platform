import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { TableCell, TableRow } from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import {
  getTwilioMessageCategoryBadgeVariant,
  getWhatsAppApprovalStatusBadgeVariant,
} from "@/lib/badge-variants";
import { useMutation } from "convex/react";
import { FunctionReturnType } from "convex/server";
import { format } from "date-fns";
import { MoreVerticalIcon, TrashIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";

type RowData = FunctionReturnType<
  typeof api.domains.twilioMessageTemplates.queries.getTwilioMessageTemplates
>["page"][number];

export function MessageTemplateTableRow({
  messageTemplate,
}: {
  messageTemplate: RowData;
}) {
  const [openDelete, setOpenDelete] = React.useState(false);

  const deleteMessageTemplate = useMutation(
    api.domains.twilioMessageTemplates.mutations.deleteTwilioMessageTemplate,
  );

  const [isDeleting, setIsDeleting] = React.useState(false);

  const onDelete = () => {
    setIsDeleting(true);

    toast.promise(deleteMessageTemplate({ id: messageTemplate._id }), {
      loading: "Submitting deletion request...",

      success: () => {
        setOpenDelete(false);
        return "Deletion request submitted successfully";
      },

      error: "Failed to submit deletion request",

      finally: () => {
        setIsDeleting(false);
      },
    });
  };

  return (
    <>
      <TableRow key={messageTemplate._id}>
        <TableCell>
          <div>{messageTemplate.name}</div>
          <div className="text-muted-foreground font-mono text-xs">
            {messageTemplate.twilioContentSid}
          </div>
        </TableCell>
        <TableCell>
          <Badge
            variant={getTwilioMessageCategoryBadgeVariant(
              messageTemplate.messageCategory,
            )}
          >
            {messageTemplate.messageCategory}
          </Badge>
        </TableCell>
        <TableCell>
          {messageTemplate.whatsAppApprovalStatus ? (
            <Badge
              variant={getWhatsAppApprovalStatusBadgeVariant(
                messageTemplate.whatsAppApprovalStatus,
              )}
            >
              {messageTemplate.whatsAppApprovalStatus}
            </Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </TableCell>
        <TableCell>{format(messageTemplate._creationTime, "PPPpp")}</TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVerticalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setOpenDelete(true)}
              >
                <TrashIcon />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message template? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={onDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Spinner />}
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
