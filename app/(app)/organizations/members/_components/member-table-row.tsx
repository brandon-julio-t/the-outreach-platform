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
import { Spinner } from "@/components/ui/spinner";
import { TableCell, TableRow } from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { format } from "date-fns";
import { MoreVerticalIcon, PencilIcon, TrashIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { EditMemberDialog } from "./edit-member-dialog";
import type { RowData } from "./types";

export function MemberTableRow({ member }: { member: RowData }) {
  const currentUser = useQuery(api.auth.getCurrentUser);

  const isSelf = currentUser?._id === member.userId;

  const [openEdit, setOpenEdit] = React.useState(false);
  const [openDelete, setOpenDelete] = React.useState(false);

  const deleteOrganizationMember = useMutation(
    api.domains.organizationMembers.mutations.deleteOrganizationMember,
  );
  const [isDeleting, setIsDeleting] = React.useState(false);

  const onDelete = () => {
    setIsDeleting(true);

    toast.promise(
      deleteOrganizationMember({ organizationMemberId: member._id }),
      {
        loading: "Deleting member...",
        success: () => {
          setOpenDelete(false);
          return "Member deleted successfully";
        },
        error: (error) => {
          return {
            message: "Failed to delete member",
            description:
              error instanceof ConvexError ? error.data : "Please try again.",
          };
        },
        finally: () => {
          setIsDeleting(false);
        },
      },
    );
  };
  return (
    <>
      <TableRow key={member._id}>
        <TableCell>{member.user?.name}</TableCell>
        <TableCell>{member.user?.email}</TableCell>
        <TableCell>
          {member.user?._creationTime &&
            format(member.user?._creationTime, "PPPpp")}
        </TableCell>
        <TableCell>
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
              {!isSelf && (
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setOpenDelete(true)}
                >
                  <TrashIcon />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <EditMemberDialog member={member} open={openEdit} setOpen={setOpenEdit} />

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this member? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={onDelete}
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
