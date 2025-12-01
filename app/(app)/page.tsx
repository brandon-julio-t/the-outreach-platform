"use client";

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { DashboardBroadcastsSection } from "./_components/dashboard/broadcasts-section";
import { DashboardContactsSection } from "./_components/dashboard/contacts-section";
import { DashboardOutboundMessagesSection } from "./_components/dashboard/outbound-messages-section";

const AppPage = () => {
  return (
    <div className="container mx-auto">
      <ItemGroup className="gap-6">
        <Item>
          <ItemContent>
            <ItemTitle>Home</ItemTitle>
            <ItemDescription>
              Overview of your outreach campaigns.
            </ItemDescription>
          </ItemContent>
        </Item>

        <DashboardContactsSection filterType="goals_achieved" />

        <DashboardContactsSection filterType="ai_assistant_disabled" />

        <DashboardContactsSection filterType="in_progress" />

        <DashboardBroadcastsSection />

        <DashboardOutboundMessagesSection />
      </ItemGroup>
    </div>
  );
};

export default AppPage;
