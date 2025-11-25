"use client";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { useIsClient } from "usehooks-ts";
import { ContactRightSidebar } from "./_components/contact-right-sidebar";
import { ContactsListLeftSidebar } from "./_components/contacts-list-left-sidebar";

export default function ChatLayout({ children }: LayoutProps<"/chats">) {
  const isClient = useIsClient();

  if (!isClient) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Spinner />
          </EmptyMedia>
          <EmptyTitle>Loading chat interface...</EmptyTitle>
          <EmptyDescription>
            We are loading the chat interface for you. Please wait a moment.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <SidebarProvider defaultOpen className="min-h-auto">
      <ResizablePanelGroup
        autoSaveId="chat-layout-resizable-panel-group"
        direction="horizontal"
        className="flex size-full h-(--page-height) min-w-0 flex-row"
      >
        <ResizablePanel defaultSize={20} className="hidden md:block">
          <ContactsListLeftSidebar />
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={80}>{children}</ResizablePanel>
      </ResizablePanelGroup>

      <ContactRightSidebar />
    </SidebarProvider>
  );
}
