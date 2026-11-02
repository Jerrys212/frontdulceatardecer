import { TriangleAlertIcon } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { CashierPerformance } from "@/data/reports/types";
import { PAYMENT_METHOD_LABELS } from "@/data/sales/types";
import { formatCurrency, formatNumber } from "@/lib/formats";

const ALERT_RATIO = 0.1;

function isHigh(count: number, salesCount: number) {
  return count > 0 && count >= Math.max(1, salesCount) * ALERT_RATIO;
}

function AlertValue({ count, amount, high }: { count: number; amount: number; high: boolean }) {
  return (
    <span className={high ? "inline-flex flex-col items-end font-medium text-danger" : "inline-flex flex-col items-end"}>
      <span className="inline-flex items-center gap-1 tabular-nums">
        {high && <TriangleAlertIcon className="size-3.5" aria-label="Valor alto" />}
        {formatNumber(count)}
      </span>
      {count > 0 && <span className="text-xs text-muted-foreground tabular-nums">{formatCurrency(amount)}</span>}
    </span>
  );
}

export function CashiersTable({ cashiers }: { cashiers: CashierPerformance[] }) {
  return (
    <div className="-mx-4 -mb-4 overflow-hidden border-t border-border">
      <Table>
        <TableHeader className="bg-muted/60">
          <TableRow>
            <TableHead className="pl-4">Usuario</TableHead>
            <TableHead className="text-right">Ventas</TableHead>
            <TableHead className="text-right">Ingresos</TableHead>
            <TableHead className="text-right">Ticket prom.</TableHead>
            <TableHead>Por método</TableHead>
            <TableHead className="text-right">Cancelaciones</TableHead>
            <TableHead className="pr-4 text-right">Reducciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cashiers.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                Nadie cobró, canceló ni modificó ventas en este periodo.
              </TableCell>
            </TableRow>
          ) : (
            cashiers.map((cashier) => (
              <TableRow key={cashier.cashierId} className="align-top">
                <TableCell className="pl-4 font-medium">{cashier.cashierName}</TableCell>
                <TableCell className="text-right tabular-nums">{formatNumber(cashier.salesCount)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatCurrency(cashier.revenue)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatCurrency(cashier.averageTicket)}</TableCell>
                <TableCell>
                  <dl className="grid grid-cols-[auto_auto] gap-x-3 text-xs">
                    {cashier.paymentMethods.map((method) => (
                      <div key={method.method} className="contents">
                        <dt className="text-muted-foreground">{PAYMENT_METHOD_LABELS[method.method]}</dt>
                        <dd className="text-right tabular-nums">{formatCurrency(method.amount)}</dd>
                      </div>
                    ))}
                  </dl>
                </TableCell>
                <TableCell className="text-right">
                  <AlertValue
                    count={cashier.cancelledCount}
                    amount={cashier.cancelledAmount}
                    high={isHigh(cashier.cancelledCount, cashier.salesCount)}
                  />
                </TableCell>
                <TableCell className="pr-4 text-right">
                  <AlertValue
                    count={cashier.reductionsCount}
                    amount={cashier.reducedAmount}
                    high={isHigh(cashier.reductionsCount, cashier.salesCount)}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
