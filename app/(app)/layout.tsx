import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import { AppSidebar } from "./_components/app-sidebar";

const AppLayout = async ({ children }: LayoutProps<"/">) => {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />

      <SidebarInset className="size-full min-w-0">{children}</SidebarInset>
    </SidebarProvider>
  );
};

export default AppLayout;
