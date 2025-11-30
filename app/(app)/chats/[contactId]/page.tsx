import type { Id } from "@/convex/_generated/dataModel";
import { ChatDetailsPageView } from "./_components/page-view";

export default async function ChatDetailsPage(
  props: PageProps<"/chats/[contactId]">,
) {
  const params = await props.params;

  return <ChatDetailsPageView contactId={params.contactId as Id<"contacts">} />;
}
