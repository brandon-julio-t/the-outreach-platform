"use client";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

const AppPage = () => {
  return (
    <div className="container mx-auto p-4">
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia>👋</EmptyMedia>
          <EmptyTitle>Welcome to the app</EmptyTitle>
          <EmptyDescription>
            This is the home page of the app. You can start by creating a new
            broadcast, contact, or chat.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
};

export default AppPage;
