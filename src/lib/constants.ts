import { LayoutGridIcon, UsersIcon, type LucideIcon } from "lucide-react";

import type { Role } from "@/data/auth/types";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
};

export type NavGroup = {
  title?: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    items: [{ title: "Inicio", href: "/", icon: LayoutGridIcon, roles: ["Admin", "Cashier", "Kitchen"] }],
  },
  {
    title: "Administración",
    items: [{ title: "Usuarios", href: "/users", icon: UsersIcon, roles: ["Admin"] }],
  },
];

export function getNavigation(role: Role): NavGroup[] {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes(role)),
  })).filter((group) => group.items.length > 0);
}
