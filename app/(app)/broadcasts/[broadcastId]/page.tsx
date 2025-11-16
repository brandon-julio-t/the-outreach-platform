import { Id } from "@/convex/_generated/dataModel";
import BroadcastDetailsPageView from "./_components/page-view";

export default async function BroadcastDetailsPage(
  props: PageProps<"/broadcasts/[broadcastId]">,
) {
  const params = await props.params;
  return (
    <BroadcastDetailsPageView
      broadcastId={params.broadcastId as Id<"twilioMessageBroadcasts">}
    />
  );
}
