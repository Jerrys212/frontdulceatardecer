import { LayoutGridIcon, StoreIcon, UsersIcon, type LucideIcon } from "lucide-react";

import type { Role } from "@/data/auth/types";

export type NavLink = {
  title: string;
  href: string;
};

export type NavItem = {
  title: string;
  icon: LucideIcon;
  roles: Role[];
} & ({ href: string; children?: never } | { href?: never; children: NavLink[] });

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
    items: [
      {
        title: "Catálogo",
        icon: StoreIcon,
        roles: ["Admin"],
        children: [{ title: "Categorías", href: "/catalog/categories" }],
      },
      { title: "Usuarios", href: "/users", icon: UsersIcon, roles: ["Admin"] },
    ],
  },
];

export function getNavigation(role: Role): NavGroup[] {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes(role)),
  })).filter((group) => group.items.length > 0);
}
