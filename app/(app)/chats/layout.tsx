import { ContactsLeftSidebar } from "./_components/contacts-left-sidebar";

export default function ChatLayout({ children }: LayoutProps<"/chats">) {
  return (
    <div className="flex size-full h-(--page-height) flex-row">
      <ContactsLeftSidebar />

      <section className="flex-1">{children}</section>
    </div>
  );
}
