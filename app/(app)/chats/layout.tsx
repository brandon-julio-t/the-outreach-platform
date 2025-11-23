import { ContactsLeftSidebar } from "./_components/contacts-left-sidebar";

export default function ChatLayout({ children }: LayoutProps<"/chats">) {
  return (
    <main className="flex size-full h-full max-h-(--chat-page-height) flex-row [--chat-page-height:calc(100vh-var(--header-height))]">
      <section className="w-80 overflow-y-auto border-r p-1">
        <ContactsLeftSidebar />
      </section>
      <section className="flex-1">{children}</section>
    </main>
  );
}
