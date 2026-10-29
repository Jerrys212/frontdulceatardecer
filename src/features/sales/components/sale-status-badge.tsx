import { Badge } from "@/components/ui/badge";
import { SALE_STATUS_LABELS, type SaleStatus } from "@/data/sales/types";

const STATUS_VARIANTS = {
  Preparing: "warning",
  Paid: "success",
  Cancelled: "danger",
} as const satisfies Record<SaleStatus, React.ComponentProps<typeof Badge>["variant"]>;

export function SaleStatusBadge({ status, className }: { status: SaleStatus; className?: string }) {
  return (
    <Badge variant={STATUS_VARIANTS[status]} className={className}>
      {SALE_STATUS_LABELS[status]}
    </Badge>
  );
}
