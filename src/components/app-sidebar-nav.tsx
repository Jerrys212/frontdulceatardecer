"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "cn";

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
import { getNavigation, type NavGroup, type NavItem } from "@/lib/constants";

const MENU_ITEM_CLASS =
  "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground-active data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-foreground-active";
const MENU_BUTTON_CLASS = cn("h-10", MENU_ITEM_CLASS);

function matchesPath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function findActiveHref(groups: NavGroup[], pathname: string) {
  const hrefs = groups.flatMap((group) =>
    group.items.flatMap((item) => (item.children ? item.children.map((child) => child.href) : [item.href])),
  );
  return hrefs
    .filter((href) => matchesPath(pathname, href))
    .reduce<string | null>((longest, href) => (longest && longest.length >= href.length ? longest : href), null);
}

function NavEntry({ item, activeHref, onNavigate }: { item: NavItem; activeHref: string | null; onNavigate: () => void }) {
  const Icon = item.icon;

  if (item.children) {
    const groupActive = item.children.some((child) => child.href === activeHref);
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
                const active = child.href === activeHref;
                return (
                  <SidebarMenuSubItem key={child.href}>
                    <SidebarMenuSubButton
                      asChild
                      isActive={active}
                      className={cn("h-9", MENU_ITEM_CLASS)}
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

  const active = item.href === activeHref;
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
  const navigation = getNavigation(role);
  const activeHref = findActiveHref(navigation, pathname);
  const { isMobile, setOpenMobile } = useSidebar();
  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <nav aria-label="Navegación principal">
      {navigation.map((group, index) => (
        <SidebarGroup key={group.title ?? index}>
          {group.title && (
            <SidebarGroupLabel className="text-xs font-semibold tracking-wider text-sidebar-title uppercase">
              {group.title}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => (
                <NavEntry key={item.title} item={item} activeHref={activeHref} onNavigate={closeOnMobile} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </nav>
  );
}
