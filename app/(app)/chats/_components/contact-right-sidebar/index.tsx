"use client";

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { PencilIcon } from "lucide-react";
import { useParams } from "next/navigation";
import React from "react";
import { EditContactDialog } from "../../../contacts/_components/edit-contact-dialog";
import { AiAssistantSwitch } from "./ai-assistant-switch";

export function ContactRightSidebar() {
  const params = useParams();
  const contactId = params.contactId?.toString() as undefined | Id<"contacts">;

  const currentOrganization = useQuery(
    api.domains.organizations.queries.getCurrentUserActiveOrganization,
  );

  const contactQuery = useQuery(
    api.domains.contacts.queries.getContactById,
    currentOrganization?._id && contactId
      ? { id: contactId, organizationId: currentOrganization._id }
      : "skip",
  );

  const isLoading =
    currentOrganization === undefined || contactQuery === undefined;

  const [openEdit, setOpenEdit] = React.useState(false);

  const { toggleSidebar } = useSidebar();

  if (currentOrganization === null || contactQuery === null) {
    return null;
  }

  return (
    <Sidebar side="right">
      <SidebarHeader>
        <Item size="sm">
          <ItemContent>
            <ItemTitle>{contactQuery?.name}</ItemTitle>
            <ItemDescription>{contactQuery?.phone}</ItemDescription>
          </ItemContent>
          {isLoading && (
            <ItemMedia>
              <Spinner />
            </ItemMedia>
          )}
        </Item>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {isLoading ? (
            <SidebarMenu>
              <SidebarMenuSkeleton />
              <SidebarMenuSkeleton />
              <SidebarMenuSkeleton />
              <SidebarMenuSkeleton />
              <SidebarMenuSkeleton />
            </SidebarMenu>
          ) : (
            <SidebarMenu>
              <SidebarMenuItem>
                <AiAssistantSwitch
                  contactId={contactQuery._id}
                  organizationId={currentOrganization._id}
                />
              </SidebarMenuItem>

              {/* TODO: display all the notes here */}
            </SidebarMenu>
          )}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="justify-center"
              onClick={() => setOpenEdit(true)}
              disabled={isLoading}
            >
              {isLoading ? <Spinner /> : <PencilIcon />}
              Edit Contact
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem className="md:hidden">
            <SidebarMenuButton
              onClick={toggleSidebar}
              className="justify-center"
            >
              Close Sidebar
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {contactQuery && (
        <EditContactDialog
          contact={contactQuery}
          open={openEdit}
          setOpen={setOpenEdit}
        />
      )}
    </Sidebar>
  );
}
