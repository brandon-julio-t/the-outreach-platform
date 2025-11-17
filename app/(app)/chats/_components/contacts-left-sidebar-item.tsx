import { Button } from "@/components/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { api } from "@/convex/_generated/api";
import { FunctionReturnType } from "convex/server";
import Link from "next/link";
import { useParams } from "next/navigation";

type ContactData = FunctionReturnType<
  typeof api.domains.contacts.queries.getContacts
>["page"][number];

export function ContactsLeftSidebarItem({ contact }: { contact: ContactData }) {
  const params = useParams();
  const contactId = params.contactId?.toString();

  const isActive = contactId === contact._id;

  return (
    <Button
      className="h-auto"
      variant={isActive ? "secondary" : "ghost"}
      asChild
    >
      <Link href={`/chats/${contact._id}`}>
        <Item size="sm" className="size-full justify-start text-left">
          <ItemContent>
            <ItemTitle>{contact.name}</ItemTitle>
            <ItemDescription>{contact.phone}</ItemDescription>
          </ItemContent>
        </Item>
      </Link>
    </Button>
  );
}
