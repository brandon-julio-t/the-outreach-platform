"use client";

import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import Link from "next/link";

export default function MessageTemplatesPage() {
  return (
    <main className="container mx-auto">
      <ItemGroup>
        <Item>
          <ItemContent>
            <ItemTitle>Message Templates</ItemTitle>
            <ItemDescription>
              Message templates for your outreach campaigns.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button asChild>
              <Link href="/message-templates/create">Add Message Template</Link>
            </Button>
          </ItemActions>
        </Item>
      </ItemGroup>{" "}
    </main>
  );
}
