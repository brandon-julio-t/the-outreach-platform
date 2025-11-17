import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function ChatIndexPage() {
  return (
    <Empty className="m-1 border">
      <EmptyHeader>
        <EmptyMedia>👋</EmptyMedia>
        <EmptyTitle>No contact selected.</EmptyTitle>
        <EmptyDescription>
          You can start by selecting a contact from the left sidebar.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
