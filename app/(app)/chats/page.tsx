import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { ContactsListDrawer } from "./_components/contacts-list-drawer";

export default function ChatIndexPage() {
  return (
    <Empty className="m-1 border">
      <EmptyHeader>
        <EmptyTitle>No contact selected.</EmptyTitle>
        <EmptyDescription>
          You can start by selecting a contact from the left sidebar or by
          clicking the button below.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <ContactsListDrawer>
          <Button>Choose contacts</Button>
        </ContactsListDrawer>
      </EmptyContent>
    </Empty>
  );
}
