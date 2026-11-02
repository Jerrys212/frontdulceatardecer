import Link from "next/link";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Cancellation } from "@/data/reports/types";
import { SALE_STATUS_LABELS, saleNumber } from "@/data/sales/types";
import { formatCurrency, formatDateTime } from "@/lib/formats";

export function CancellationsTable({ cancellations }: { cancellations: Cancellation[] }) {
  return (
    <Table>
      <TableHeader className="bg-muted/60">
        <TableRow>
          <TableHead className="pl-4">Venta</TableHead>
          <TableHead>Cancelada</TableHead>
          <TableHead>Registró</TableHead>
          <TableHead>Canceló</TableHead>
          <TableHead>Estaba</TableHead>
          <TableHead className="text-right">Monto</TableHead>
          <TableHead className="pr-4">Motivo</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cancellations.length === 0 ? (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
              Sin cancelaciones en este periodo.
            </TableCell>
          </TableRow>
        ) : (
          cancellations.map((cancellation) => (
            <TableRow key={cancellation.saleId} className="align-top">
              <TableCell className="pl-4 font-medium tabular-nums">
                <Link href={`/sales/${cancellation.saleId}`} className="rounded-sm hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
                  {saleNumber(cancellation.saleId)}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground tabular-nums">
                <time dateTime={cancellation.cancelledAt}>{formatDateTime(cancellation.cancelledAt)}</time>
              </TableCell>
              <TableCell>{cancellation.cashierName}</TableCell>
              <TableCell>{cancellation.cancelledByName}</TableCell>
              <TableCell>{SALE_STATUS_LABELS[cancellation.previousStatus]}</TableCell>
              <TableCell className="text-right tabular-nums">{formatCurrency(cancellation.amount)}</TableCell>
              <TableCell className="max-w-64 pr-4 whitespace-normal text-muted-foreground">{cancellation.reason}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
