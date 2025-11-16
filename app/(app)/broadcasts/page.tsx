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

export default function BroadcastsPage() {
  return (
    <main className="container mx-auto">
      <ItemGroup>
        <Item>
          <ItemContent>
            <ItemTitle>Broadcasts</ItemTitle>
            <ItemDescription>
              Broadcasts for your outreach campaigns.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button asChild>
              <Link href="/broadcasts/create">Create Broadcast</Link>
            </Button>
          </ItemActions>
        </Item>
      </ItemGroup>
    </main>
  );
}
