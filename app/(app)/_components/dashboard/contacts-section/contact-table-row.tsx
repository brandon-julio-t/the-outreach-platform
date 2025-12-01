import { Message, MessageResponse } from "@/components/ai-elements/message";
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
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api } from "@/convex/_generated/api";
import type { contactFilterTypes } from "@/convex/domains/contacts/configs";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { useMutation } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { format, formatDistanceToNow } from "date-fns";
import {
  EyeIcon,
  MessageCircleIcon,
  MoreVerticalIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { toast } from "sonner";
import { EditContactDialog } from "../../../contacts/_components/edit-contact-dialog";

type RowData = FunctionReturnType<
  typeof api.domains.contacts.queries.getContacts
>["page"][number];

export function DashboardContactTableRow({
  contact,
  filterType,
}: {
  contact: RowData;
  filterType: (typeof contactFilterTypes)[number];
}) {
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

  const currentOrganization = useQuery(
    api.domains.organizations.queries.getCurrentUserActiveOrganization,
  );

  const latestMessage = useQuery(
    api.domains.twilioMessages.queries.getLatestTwilioMessagesByContactId,
    currentOrganization?._id && filterType === "in_progress"
      ? {
          organizationId: currentOrganization._id,
          contactId: contact._id,
        }
      : "skip",
  );

  const humanTime = contact.latestMessageTime
    ? format(contact.latestMessageTime, "PPp")
    : "";
  const relativeTime = contact.latestMessageTime
    ? formatDistanceToNow(contact.latestMessageTime, { addSuffix: true })
    : "";

  return (
    <>
      <TableRow key={contact._id}>
        <TableCell>
          <ItemContent>
            <ItemTitle>{contact.name}</ItemTitle>
            <ItemDescription>{contact.phone}</ItemDescription>
          </ItemContent>
        </TableCell>

        {filterType === "goals_achieved" && (
          <TableCell>
            <Item className="p-0">
              <ItemContent>
                <ItemDescription className="max-w-xs">
                  <MessageResponse>{contact.goalsAchievedNote}</MessageResponse>
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button variant="ghost">
                      <EyeIcon />
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="mx-auto max-w-xl">
                    <DrawerHeader>
                      <DrawerTitle>Goals Achieved Note</DrawerTitle>
                      <DrawerDescription>
                        Note about the details of the goals achieved.
                      </DrawerDescription>
                    </DrawerHeader>

                    <MessageResponse
                      mode="static"
                      className="w-full overflow-auto px-4"
                    >
                      {contact.goalsAchievedNote}
                    </MessageResponse>

                    <DrawerFooter>
                      <DrawerClose asChild>
                        <Button variant="outline">Close</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              </ItemActions>
            </Item>
          </TableCell>
        )}

        {filterType === "ai_assistant_disabled" && (
          <TableCell>
            <Item className="p-0">
              <ItemContent>
                <ItemDescription className="max-w-xs">
                  <MessageResponse>
                    {contact.aiAssistantDisabledReason}
                  </MessageResponse>
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button variant="ghost">
                      <EyeIcon />
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="mx-auto max-w-xl">
                    <DrawerHeader>
                      <DrawerTitle>AI Assistant Disabled Reason</DrawerTitle>
                      <DrawerDescription>
                        Reason for disabling the AI assistant.
                      </DrawerDescription>
                    </DrawerHeader>

                    <MessageResponse
                      mode="static"
                      className="w-full overflow-auto px-4"
                    >
                      {contact.aiAssistantDisabledReason}
                    </MessageResponse>

                    <DrawerFooter>
                      <DrawerClose asChild>
                        <Button variant="outline">Close</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              </ItemActions>
            </Item>
          </TableCell>
        )}

        {filterType === "in_progress" && (
          <TableCell>
            <Item className="p-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <ItemDescription className="line-clamp-1 break-all">
                    {latestMessage?.body ? <>{latestMessage.body}</> : ""}
                  </ItemDescription>
                </TooltipTrigger>
                <TooltipContent>
                  {latestMessage?.body ? (
                    <Message from="assistant">
                      <div className="text-xs">{latestMessage.displayName}</div>
                      <MessageResponse>{latestMessage.body}</MessageResponse>
                    </Message>
                  ) : (
                    contact.phone
                  )}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger
                  className="text-muted-foreground text-xs"
                  asChild
                >
                  <ItemDescription>{relativeTime}</ItemDescription>
                </TooltipTrigger>
                <TooltipContent>{humanTime}</TooltipContent>
              </Tooltip>
            </Item>
          </TableCell>
        )}

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
