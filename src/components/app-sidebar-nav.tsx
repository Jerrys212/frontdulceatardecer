"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDownIcon } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { Role } from "@/data/auth/types";
import { getNavigation, type NavItem } from "@/lib/constants";

const MENU_BUTTON_CLASS =
  "h-10 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground-active data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-foreground-active";

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function NavEntry({ item, pathname, onNavigate }: { item: NavItem; pathname: string; onNavigate: () => void }) {
  const Icon = item.icon;

  if (item.children) {
    const groupActive = item.children.some((child) => isActivePath(pathname, child.href));
    return (
      <Collapsible asChild defaultOpen={groupActive} className="group/collapsible">
        <SidebarMenuItem className="rounded-md data-[state=open]:bg-sidebar-group-open">
          <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip={item.title} className={MENU_BUTTON_CLASS}>
              <Icon />
              <span>{item.title}</span>
              <ChevronDownIcon className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub className="border-sidebar-border">
              {item.children.map((child) => {
                const active = isActivePath(pathname, child.href);
                return (
                  <SidebarMenuSubItem key={child.href}>
                    <SidebarMenuSubButton
                      asChild
                      isActive={active}
                      className="h-9 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground-active data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-foreground-active"
                    >
                      <Link href={child.href} aria-current={active ? "page" : undefined} onClick={onNavigate}>
                        <span>{child.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                );
              })}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  const active = isActivePath(pathname, item.href);
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active} tooltip={item.title} className={MENU_BUTTON_CLASS}>
        <Link href={item.href} aria-current={active ? "page" : undefined} onClick={onNavigate}>
          <Icon />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebarNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

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
              {group.items.map((item) => (
                <NavEntry key={item.title} item={item} pathname={pathname} onNavigate={closeOnMobile} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </nav>
  );
}
