"use client";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { navItems } from "./_components/app-sidebar";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const AppPage = () => {
  return (
    <main className="container mx-auto p-4">
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia>👋</EmptyMedia>
          <EmptyTitle>Welcome to the app</EmptyTitle>
          <EmptyDescription>
            This is the home page of the app. You can start by creating a new
            broadcast, contact, or chat.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex flex-row flex-wrap justify-center gap-2">
            {navItems.map((item) => (
              <Button asChild key={item.title} variant="outline">
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </Button>
            ))}
          </div>
        </EmptyContent>
      </Empty>
    </main>
  );
};

export default AppPage;
