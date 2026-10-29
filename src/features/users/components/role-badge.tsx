import { cn } from "cn";

import { Badge } from "@/components/ui/badge";
import type { Role } from "@/data/auth/types";
import { ROLE_LABELS } from "@/lib/auth/routes";

const ROLE_STYLES: Record<Role, string> = {
  Admin: "bg-primary text-primary-foreground",
  Cashier: "bg-info text-primary-foreground",
  Kitchen: "bg-warning text-dark",
};

export function RoleBadge({ role, className }: { role: Role; className?: string }) {
  return <Badge className={cn("rounded-sm font-semibold", ROLE_STYLES[role], className)}>{ROLE_LABELS[role]}</Badge>;
}
