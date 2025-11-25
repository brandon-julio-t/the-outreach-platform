"use client";

import {
  Item,
  ItemActions,
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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { format } from "date-fns";
import {
  CheckIcon,
  CircleDashedIcon,
  PanelRightIcon,
  PencilIcon,
} from "lucide-react";
import { useParams } from "next/navigation";
import React from "react";
import { EditContactDialog } from "../../../contacts/_components/edit-contact-dialog";
import { AiAssistantDisabledReason } from "./ai-assistant-disabled-reason";
import { AiAssistantSwitch } from "./ai-assistant-switch";
import { ContactGoalInformation } from "./contact-goal-information";

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
    <Sidebar
      side="right"
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]"
    >
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <Item size="sm">
            <ItemContent>
              <ItemTitle>{contactQuery?.name}</ItemTitle>
              <ItemDescription>{contactQuery?.phone}</ItemDescription>
            </ItemContent>
            <ItemActions>
              {isLoading ? (
                <Spinner />
              ) : (
                <SidebarTrigger>
                  <PanelRightIcon />
                </SidebarTrigger>
              )}
            </ItemActions>
          </Item>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {isLoading ? (
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuSkeleton />
              <SidebarMenuSkeleton />
              <SidebarMenuSkeleton />
              <SidebarMenuSkeleton />
              <SidebarMenuSkeleton />
            </SidebarMenu>
          </SidebarGroup>
        ) : (
          <>
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <AiAssistantSwitch contact={contactQuery} />
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <AiAssistantDisabledReason contact={contactQuery} />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Item
                    variant="outline"
                    data-state={
                      contactQuery.goalsAchievedTime ? "achieved" : "pending"
                    }
                    className={cn(
                      "group",
                      "data-[state=achieved]:bg-success/10 data-[state=achieved]:border-success/40 data-[state=achieved]:text-success",
                    )}
                  >
                    <ItemContent>
                      <ItemTitle>Goals Achieved?</ItemTitle>
                      <ItemDescription>
                        {contactQuery.goalsAchievedTime
                          ? `Yes, on ${format(contactQuery.goalsAchievedTime, "PPp")}`
                          : "In Progress"}
                      </ItemDescription>
                    </ItemContent>
                    <ItemMedia
                      variant="icon"
                      className="group-data-[state=achieved]:border-success/35 group-data-[state=achieved]:bg-success/5"
                    >
                      <CircleDashedIcon className="group-data-[state=achieved]:hidden" />
                      <CheckIcon className="group-data-[state=pending]:hidden" />
                    </ItemMedia>
                  </Item>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <ContactGoalInformation contact={contactQuery} />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t">
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
