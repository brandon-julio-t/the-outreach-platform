"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ContactsListLeftSidebar } from "./_components/contacts-list-left-sidebar";

export default function ChatLayout({ children }: LayoutProps<"/chats">) {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="flex size-full h-(--page-height) min-w-0 flex-row"
    >
      <ResizablePanel defaultSize={25} className="hidden md:block">
        <ContactsListLeftSidebar />
      </ResizablePanel>

      <ResizableHandle />

      <ResizablePanel defaultSize={75}>{children}</ResizablePanel>
    </ResizablePanelGroup>
  );
}
