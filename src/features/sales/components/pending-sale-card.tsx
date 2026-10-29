import Link from "next/link";
import { NotebookPenIcon } from "lucide-react";

import type { Role } from "@/data/auth/types";
import { saleNumber, type Sale } from "@/data/sales/types";
import { ElapsedTime } from "@/features/sales/components/elapsed-time";
import { SaleActions } from "@/features/sales/components/sale-actions";
import { SaleStatusBadge } from "@/features/sales/components/sale-status-badge";
import { formatCurrency } from "@/lib/formats";

export function PendingSaleCard({ sale, role }: { sale: Sale; role: Role }) {
  return (
    <article
      aria-labelledby={`sale-${sale.id}`}
      className="flex flex-col overflow-hidden rounded-md border border-border-translucent bg-card"
    >
      <header className="flex flex-col gap-1 border-b border-border bg-muted/40 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <Link
              id={`sale-${sale.id}`}
              href={`/sales/${sale.id}`}
              className="font-semibold tabular-nums hover:text-link hover:underline"
            >
              {saleNumber(sale.id)}
            </Link>
            <SaleStatusBadge status={sale.status} />
          </span>
          <ElapsedTime since={sale.createdAt} />
        </div>
        <p className={sale.customerDescription ? "text-sm" : "text-sm text-muted-foreground"}>
          {sale.customerDescription ?? "Sin descripción"}
        </p>
      </header>
      <ul className="flex flex-1 flex-col gap-2 px-4 py-3 text-sm">
        {sale.items.map((item, index) => (
          <li key={`${item.productId}-${index}`}>
            <p>
              <span className="font-semibold tabular-nums">{item.quantity}×</span> {item.productName}
            </p>
            {item.extras.map((extra) => (
              <p key={extra.extraId} className="pl-5 text-xs text-muted-foreground">
                + {extra.name}
                {extra.quantity > 1 && ` ×${extra.quantity}`}
              </p>
            ))}
            {item.note && (
              <p className="flex items-start gap-1 pl-5 text-xs text-warning italic">
                <NotebookPenIcon className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
                {item.note}
              </p>
            )}
          </li>
        ))}
      </ul>
      <footer className="flex flex-col gap-3 border-t border-border px-4 py-3">
        <div className="flex items-end justify-between gap-2">
          <span className="text-xs text-muted-foreground">Registró: {sale.cashierName}</span>
          <span className="text-lg font-semibold tabular-nums">{formatCurrency(sale.total)}</span>
        </div>
        <SaleActions sale={sale} role={role} layout="card" />
      </footer>
    </article>
  );
}
