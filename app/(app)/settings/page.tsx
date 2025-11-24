"use client";

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { AiAssistantSection } from "./ai-assistant-section";
import { TestTwilioSection } from "./test-twilio-section";
import { TwilioSettingsSection } from "./twilio-settings-section";

export default function SettingsPage() {
  return (
    <div className="container mx-auto pb-6">
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

        <AiAssistantSection />
      </ItemGroup>
    </div>
  );
}
