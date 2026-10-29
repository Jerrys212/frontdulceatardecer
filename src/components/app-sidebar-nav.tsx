"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { Role } from "@/data/auth/types";
import { getNavigation } from "@/lib/constants";

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebarNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <nav aria-label="Navegación principal">
      {getNavigation(role).map((group, index) => (
        <SidebarGroup key={group.title ?? index}>
          {group.title && (
            <SidebarGroupLabel className="text-[0.7rem] font-semibold tracking-wider text-sidebar-title uppercase">
              {group.title}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map(({ title, href, icon: Icon }) => {
                const active = isActivePath(pathname, href);
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={title}
                      className="h-10 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground-active data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-foreground-active"
                    >
                      <Link
                        href={href}
                        aria-current={active ? "page" : undefined}
                        onClick={() => isMobile && setOpenMobile(false)}
                      >
                        <Icon />
                        <span>{title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </nav>
  );
}
