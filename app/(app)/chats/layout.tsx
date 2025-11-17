import { ContactsLeftSidebar } from "./_components/contacts-left-sidebar";

export default function ChatLayout({ children }: LayoutProps<"/chats">) {
  return (
    <main className="flex size-full min-h-(--chat-page-height) flex-row [--chat-page-height:calc(100vh-var(--header-height))]">
      <section className="w-80 border-r p-1">
        <ContactsLeftSidebar />
      </section>
      <section className="flex-1">{children}</section>
    </main>
  );
}
