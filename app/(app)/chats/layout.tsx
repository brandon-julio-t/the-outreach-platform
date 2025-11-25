"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ContactRightSidebar } from "./_components/contact-right-sidebar";
import { ContactsListLeftSidebar } from "./_components/contacts-list-left-sidebar";

export default function ChatLayout({ children }: LayoutProps<"/chats">) {
  return (
    <SidebarProvider defaultOpen className="min-h-auto">
      <ResizablePanelGroup
        direction="horizontal"
        className="flex size-full h-(--page-height) min-w-0 flex-row"
        suppressHydrationWarning={process.env.NODE_ENV === "development"}
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
