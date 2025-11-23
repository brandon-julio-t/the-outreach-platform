import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import AppHeader from "./_components/app-header";
import { AppSidebar } from "./_components/app-sidebar";
import { EnsureOrganizationDialog } from "./_components/ensure-organization-dialog";

const AppLayout = async ({ children }: LayoutProps<"/">) => {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <>
      <EnsureOrganizationDialog />

      <SidebarProvider
        defaultOpen={defaultOpen}
        className="[--header-height:--spacing(12)]"
      >
        <AppSidebar />

        <SidebarInset className="size-full min-w-0">
          <AppHeader />

          {children}
        </SidebarInset>
      </SidebarProvider>
    </>
  );
};

export default AppLayout;
