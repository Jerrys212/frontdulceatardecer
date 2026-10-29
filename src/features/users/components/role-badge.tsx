import { Badge } from "@/components/ui/badge";
import type { Role } from "@/data/auth/types";
import { ROLE_LABELS } from "@/lib/auth/routes";

const ROLE_VARIANTS = {
  Admin: "default",
  Cashier: "info",
  Kitchen: "warning",
} as const satisfies Record<Role, React.ComponentProps<typeof Badge>["variant"]>;

export function RoleBadge({ role, className }: { role: Role; className?: string }) {
  return (
    <Badge variant={ROLE_VARIANTS[role]} className={className}>
      {ROLE_LABELS[role]}
    </Badge>
  );
}
