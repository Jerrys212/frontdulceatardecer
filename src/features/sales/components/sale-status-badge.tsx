import { cn } from "cn";

import { Badge } from "@/components/ui/badge";
import { SALE_STATUS_LABELS, type SaleStatus } from "@/data/sales/types";

const STATUS_STYLES: Record<SaleStatus, string> = {
  Preparing: "bg-warning text-dark",
  Paid: "bg-success text-primary-foreground",
  Cancelled: "bg-danger text-primary-foreground",
};

export function SaleStatusBadge({ status, className }: { status: SaleStatus; className?: string }) {
  return (
    <Badge className={cn("rounded-sm font-semibold", STATUS_STYLES[status], className)}>
      {SALE_STATUS_LABELS[status]}
    </Badge>
  );
}
