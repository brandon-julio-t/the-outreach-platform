"use client";

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { TestTwilioSection } from "./test-twilio-section";
import { TwilioSettingsSection } from "./twilio-settings-section";

export default function SettingsPage() {
  return (
    <main className="container mx-auto">
      <ItemGroup className="gap-4">
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
