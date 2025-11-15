"use client";

import { ThemeSwitcher } from "@/components/kibo-ui/theme-switcher";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTheme } from "next-themes";

export default function AppHeader() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex flex-row items-center justify-between border-b p-2">
      <SidebarTrigger />

      <ThemeSwitcher
        className="w-fit"
        defaultValue="system"
        onChange={setTheme}
        value={theme as "light" | "dark" | "system"}
      />
    </header>
  );
}
