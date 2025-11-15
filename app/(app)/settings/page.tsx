"use client";

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { TwilioSettingsSection } from "./twilio-settings-section";
import { TestTwilioSection } from "./test-twilio-section";

export default function SettingsPage() {
  return (
    <main className="container mx-auto">
      <ItemGroup className="gap-6">
        <Item>
          <ItemContent>
            <ItemTitle>Settings</ItemTitle>
            <ItemDescription>
              Configure your settings for your outreach campaigns.
            </ItemDescription>
          </ItemContent>
        </Item>

        <TwilioSettingsSection />

        <TestTwilioSection />
      </ItemGroup>
    </main>
  );
}
