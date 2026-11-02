import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PAYMENT_METHOD_LABELS, saleNumber, type Sale } from "@/data/sales/types";
import { SaleStatusBadge } from "@/features/sales/components/sale-status-badge";
import { formatCurrency, formatDateTime } from "@/lib/formats";

export function SalesTable({ sales }: { sales: Sale[] }) {
  return (
    <Table>
      <TableHeader className="bg-muted/60">
        <TableRow>
          <TableHead className="pl-4">Venta</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Registró</TableHead>
          <TableHead className="text-center">Estado</TableHead>
          <TableHead>Pago</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="pr-4">
            <span className="sr-only">Ver detalle</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sales.map((sale) => (
          <TableRow key={sale.id}>
            <TableCell className="pl-4 font-medium tabular-nums">
              <Link href={`/sales/${sale.id}`} className="rounded-sm hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
                {saleNumber(sale.id)}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground tabular-nums">
              <time dateTime={sale.createdAt}>{formatDateTime(sale.createdAt)}</time>
            </TableCell>
            <TableCell className="max-w-48 truncate">{sale.customerDescription ?? "—"}</TableCell>
            <TableCell>{sale.cashierName}</TableCell>
            <TableCell className="text-center">
              <SaleStatusBadge status={sale.status} />
            </TableCell>
            <TableCell>{sale.paymentMethod ? PAYMENT_METHOD_LABELS[sale.paymentMethod] : "—"}</TableCell>
            <TableCell className="text-right font-medium tabular-nums">{formatCurrency(sale.total)}</TableCell>
            <TableCell className="pr-4 text-right">
              <Link
                href={`/sales/${sale.id}`}
                aria-label={`Ver venta ${saleNumber(sale.id)}`}
                tabIndex={-1}
                className="inline-flex text-muted-foreground hover:text-foreground"
              >
                <ChevronRightIcon className="size-4" aria-hidden="true" />
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
