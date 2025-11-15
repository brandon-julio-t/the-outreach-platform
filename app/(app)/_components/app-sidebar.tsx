"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { api } from "@/convex/_generated/api";
import { useRouter } from "@bprogress/next/app";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { useMutation } from "convex/react";
import {
  CheckIcon,
  ChevronDownIcon,
  CommandIcon,
  Home,
  LogOutIcon,
  MegaphoneIcon,
  MessagesSquareIcon,
  SendIcon,
  SettingsIcon,
  User2Icon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { toast } from "sonner";

export const navItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: SettingsIcon,
  },
  {
    title: "Contacts",
    url: "/contacts",
    icon: UsersIcon,
  },
  {
    title: "Broadcasts",
    url: "/broadcasts",
    icon: MegaphoneIcon,
  },
  {
    title: "Chats",
    url: "/chats",
    icon: MessagesSquareIcon,
  },
  {
    title: "Outbound Messages",
    url: "/outbound-messages",
    icon: SendIcon,
  },
] satisfies {
  title: string;
  url: React.ComponentProps<typeof Link>["href"];
  icon: React.ElementType;
}[];

export function AppSidebar() {
  const { setOpenMobile } = useSidebar();
  const { signOut } = useAuthActions();

  const currentUser = useQuery(api.auth.getCurrentUser);
  const currentOrganization = useQuery(
    api.domains.organizations.queries.getCurrentUserActiveOrganization,
  );
  const organizations = useQuery(
    api.domains.organizations.queries.getCurrentUserOrganizations,
  );

  const setCurrentUserActiveOrganization = useMutation(
    api.domains.organizations.mutations.setCurrentUserActiveOrganization,
  );

  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (currentUser === null) {
      router.push("/login");
    }
  }, [currentUser, router]);

  const onSignOut = async () => {
    await toast
      .promise(signOut(), {
        loading: "Signing out...",
        success: "Signed out successfully",
        error: "Failed to sign out",
      })
      .unwrap();

    router.push("/login");
  };

  const isLoading = currentUser === undefined;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            {isLoading ? (
              <SidebarMenuSkeleton />
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="group">
                    <CommandIcon /> {currentOrganization?.name}
                    <ChevronDownIcon className="ml-auto transition-transform group-data-[state=open]:rotate-180" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-(--radix-dropdown-menu-trigger-width)"
                >
                  {organizations?.map((organization) => {
                    const isActive =
                      organization._id === currentOrganization?._id;
                    return (
                      <DropdownMenuItem
                        key={organization._id}
                        onClick={async () => {
                          if (isActive) {
                            return;
                          }

                          await toast
                            .promise(
                              setCurrentUserActiveOrganization({
                                organizationId: organization._id,
                              }),
                              {
                                loading: "Setting active organization...",
                                success: "Active organization set successfully",
                                error: "Failed to set active organization",
                              },
                            )
                            .unwrap();
                        }}
                      >
                        <span>{organization.name}</span>
                        {isActive && <CheckIcon className="ml-auto" />}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading
                ? Array.from({ length: 10 }).map((_, index) => (
                    <SidebarMenuItem key={index}>
                      <SidebarMenuSkeleton />
                    </SidebarMenuItem>
                  ))
                : navItems.map((item) => {
                    const isActive =
                      item.url === "/"
                        ? pathname === item.url
                        : pathname.startsWith(item.url);

                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          onClick={() => setOpenMobile(false)}
                        >
                          <Link href={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {isLoading ? (
              <SidebarMenuSkeleton />
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="group">
                    <User2Icon /> {currentUser?.name || currentUser?.email}
                    <ChevronDownIcon className="ml-auto transition-transform group-data-[state=open]:rotate-180" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-(--radix-dropdown-menu-trigger-width)"
                >
                  <DropdownMenuItem onClick={onSignOut}>
                    <LogOutIcon />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
