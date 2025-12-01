import { BadgePill, BadgePillDot } from "@/components/catalyst-ui/badge";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import { TableCell, TableRow } from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { format } from "date-fns";
import {
  MessageCircleIcon,
  MoreVerticalIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { toast } from "sonner";
import { EditContactDialog } from "./edit-contact-dialog";

type RowData = FunctionReturnType<
  typeof api.domains.contacts.queries.getContacts
>["page"][number];

export function ContactsTableRow({ contact }: { contact: RowData }) {
  const isInProgress = (contact.goalsAchievedTime ?? 0) <= 0;
  const isGoalsAchieved = (contact.goalsAchievedTime ?? 0) > 0;
  const isAiAssistantDisabled = (contact.aiAssistantDisabledTime ?? 0) > 0;

  const [openDelete, setOpenDelete] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);

  const deleteContact = useMutation(
    api.domains.contacts.mutations.deleteContact,
  );

  const [isDeleting, setIsDeleting] = React.useState(false);

  const onDelete = () => {
    setIsDeleting(true);

    toast.promise(deleteContact({ id: contact._id }), {
      loading: "Deleting contact...",
      success: () => {
        setOpenDelete(false);
        return "Contact deleted successfully";
      },
      error: "Failed to delete contact",
      finally: () => {
        setIsDeleting(false);
      },
    });
  };

  return (
    <>
      <TableRow key={contact._id}>
        <TableCell>
          <ItemContent>
            <ItemTitle>{contact.name}</ItemTitle>
            <ItemDescription>{contact.phone}</ItemDescription>
          </ItemContent>
        </TableCell>
        <TableCell>
          <div className="flex flex-row items-center gap-1 overflow-x-auto">
            {isInProgress && (
              <BadgePillDot color="yellow" size="sm">
                In Progress
              </BadgePillDot>
            )}
            {isGoalsAchieved && (
              <BadgePill color="green" size="sm">
                Goals Achieved
              </BadgePill>
            )}
            {isAiAssistantDisabled && (
              <BadgePillDot color="red" size="sm">
                AI Assistant Disabled
              </BadgePillDot>
            )}
          </div>
        </TableCell>
        <TableCell>{format(contact._creationTime, "PPPpp")}</TableCell>
        <TableCell>
          <div className="flex flex-row items-center gap-1">
            <Button variant="ghost" asChild>
              <Link href={`/chats/${contact._id}`}>
                <MessageCircleIcon />
                Chat
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVerticalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setOpenEdit(true)}>
                  <PencilIcon />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setOpenDelete(true)}
                >
                  <TrashIcon />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TableCell>
      </TableRow>

      <EditContactDialog
        contact={contact}
        open={openEdit}
        setOpen={setOpenEdit}
      />

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this contact? This action cannot
              be undone.
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
