import Link from "next/link";
import { TriangleAlertIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { MyDay } from "@/data/reports/types";
import { PAYMENT_METHOD_LABELS } from "@/data/sales/types";
import { formatCurrency, formatIsoDate, formatNumber } from "@/lib/formats";

export function MyDaySummary({ myDay }: { myDay: MyDay }) {
  const cash = myDay.paymentMethods.find((method) => method.method === "Cash")?.amount ?? 0;

  return (
    <section aria-labelledby="my-day-title" className="flex flex-col gap-4 rounded-md border border-border-translucent bg-card p-4">
      <header className="flex flex-col gap-0.5">
        <h2 id="my-day-title" className="font-semibold">
          Mi corte de hoy
        </h2>
        <p className="text-xs text-muted-foreground">{formatIsoDate(myDay.date)} · ventas que cobraste tú</p>
      </header>

      <dl className="grid gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1 rounded-md bg-muted/60 p-3">
          <dt className="text-sm text-muted-foreground">Total cobrado</dt>
          <dd className="text-2xl font-semibold tabular-nums">{formatCurrency(myDay.total)}</dd>
          <dd className="text-xs text-muted-foreground">{formatNumber(myDay.salesCount)} ventas</dd>
        </div>
        <div className="flex flex-col gap-1 rounded-md bg-muted/60 p-3">
          <dt className="text-sm text-muted-foreground">Efectivo a entregar</dt>
          <dd className="text-2xl font-semibold tabular-nums">{formatCurrency(cash)}</dd>
        </div>
        <div className="flex flex-col gap-1 rounded-md bg-muted/60 p-3">
          <dt className="text-sm text-muted-foreground">Por método</dt>
          {myDay.paymentMethods.map((method) => (
            <dd key={method.method} className="flex justify-between gap-3 text-sm tabular-nums">
              <span className="text-muted-foreground">{PAYMENT_METHOD_LABELS[method.method]}</span>
              <span>
                {formatCurrency(method.amount)}{" "}
                <span className="text-xs text-muted-foreground">({formatNumber(method.salesCount)})</span>
              </span>
            </dd>
          ))}
        </div>
      </dl>

      {myDay.preparingCount > 0 && (
        <Alert>
          <TriangleAlertIcon className="text-warning" />
          <AlertTitle>
            {myDay.preparingCount === 1
              ? "Tienes 1 venta en preparación"
              : `Tienes ${myDay.preparingCount} ventas en preparación`}{" "}
            ({formatCurrency(myDay.preparingAmount)})
          </AlertTitle>
          <AlertDescription>
            <p>
              Cóbralas o cancélalas antes de cerrar tu turno.{" "}
              <Link href="/sales/pending" className="font-medium text-link underline-offset-4 hover:underline">
                Ver pendientes
              </Link>
            </p>
          </AlertDescription>
        </Alert>
      )}
    </section>
  );
}
