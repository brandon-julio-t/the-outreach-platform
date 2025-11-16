"use client";

import { Button } from "@/components/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemTitle,
} from "@/components/ui/item";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

export default function BroadcastDetailsPage() {
  return (
    <main className="container mx-auto">
      <ItemGroup>
        <Item>
          <ItemHeader>
            <Button variant="ghost" asChild>
              <Link href="/broadcasts">
                <ArrowLeftIcon /> Back to broadcasts
              </Link>
            </Button>
          </ItemHeader>
          <ItemContent>
            <ItemTitle>Broadcast Details</ItemTitle>
            <ItemDescription>
              View the details of the broadcast.
            </ItemDescription>
          </ItemContent>
        </Item>
      </ItemGroup>
    </main>
  );
}
