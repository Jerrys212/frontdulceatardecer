import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, BanIcon, CircleCheckIcon, NotebookPenIcon, ReceiptTextIcon, type LucideIcon } from "lucide-react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ApiError } from "@/data/api-error";
import { requireRole } from "@/data/auth/require-admin";
import { getSale } from "@/data/sales/get-sales";
import { PAYMENT_METHOD_LABELS, saleNumber, type Sale } from "@/data/sales/types";
import { SaleActions } from "@/features/sales/components/sale-actions";
import { SaleStatusBadge } from "@/features/sales/components/sale-status-badge";
import { formatCurrency, formatDateTime, formatTime } from "@/lib/formats";
import { EntityIdSchema } from "@/lib/validations/ids";

export const metadata: Metadata = {
  title: "Detalle de venta",
};

type TimelineEvent = { title: string; time: string; detail: string; Icon: LucideIcon; tone: string };

function timeline(sale: Sale): TimelineEvent[] {
  const events: TimelineEvent[] = [
    {
      title: "Registrada",
      time: sale.createdAt,
      detail: `por ${sale.cashierName}`,
      Icon: ReceiptTextIcon,
      tone: "bg-warning/15 text-warning",
    },
  ];
  if (sale.paidAt) {
    events.push({
      title: "Cobrada",
      time: sale.paidAt,
      detail: sale.paymentMethod ? PAYMENT_METHOD_LABELS[sale.paymentMethod] : "",
      Icon: CircleCheckIcon,
      tone: "bg-success/15 text-success",
    });
  }
  if (sale.cancelledAt) {
    events.push({
      title: "Cancelada",
      time: sale.cancelledAt,
      detail: sale.cancelReason ?? "",
      Icon: BanIcon,
      tone: "bg-danger/15 text-danger",
    });
  }
  return events;
}

async function SaleDetail({ params }: { params: PageProps<"/sales/[id]">["params"] }) {
  const user = await requireRole(["Admin", "Cashier", "Kitchen"]);
  const id = EntityIdSchema.safeParse((await params).id);
  if (!id.success) notFound();

  let sale: Sale;
  try {
    sale = await getSale(id.data);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) notFound();
    throw error;
  }

  return (
    <>
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tabular-nums">Venta {saleNumber(sale.id)}</h1>
        <p className="text-sm text-muted-foreground">
          {[sale.customerDescription, formatDateTime(sale.createdAt)].filter(Boolean).join(" · ")}
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-labelledby="sale-products" className="overflow-hidden rounded-md border border-border-translucent bg-card">
          <h2 id="sale-products" className="border-b border-border px-4 py-3 font-semibold">
            Productos
          </h2>
          <Table>
            <TableHeader className="bg-muted/60">
              <TableRow>
                <TableHead className="pl-4">Producto</TableHead>
                <TableHead className="text-center">Cant.</TableHead>
                <TableHead className="text-right">P. unitario</TableHead>
                <TableHead className="pr-4 text-right">Importe</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sale.items.map((item, index) => (
                <TableRow key={`${item.productId}-${index}`} className="align-top">
                  <TableCell className="pl-4 whitespace-normal">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.categoryName} · {item.subcategoryName}
                    </p>
                    {item.extras.map((extra) => (
                      <p key={extra.extraId} className="flex justify-between gap-4 pl-3 text-xs text-muted-foreground">
                        <span>
                          + {extra.name} ×{extra.quantity}
                        </span>
                        <span className="tabular-nums">{extra.price === 0 ? "Gratis" : formatCurrency(extra.price)}</span>
                      </p>
                    ))}
                    {item.note && (
                      <p className="mt-1 flex items-start gap-1 text-xs text-warning italic">
                        <NotebookPenIcon className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
                        {item.note}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-center tabular-nums">{item.quantity}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell className="pr-4 text-right font-medium tabular-nums">{formatCurrency(item.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter className="bg-transparent">
              <TableRow>
                <TableCell colSpan={3} className="text-right text-muted-foreground">
                  Subtotal
                </TableCell>
                <TableCell className="pr-4 text-right tabular-nums">{formatCurrency(sale.subtotal)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} className="text-right text-muted-foreground">
                  IVA (16 %)
                </TableCell>
                <TableCell className="pr-4 text-right tabular-nums">{formatCurrency(sale.tax)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} className="text-right font-semibold">
                  Total
                </TableCell>
                <TableCell className="pr-4 text-right text-xl font-semibold tabular-nums">
                  {formatCurrency(sale.total)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
          <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
            Los nombres y precios se muestran como estaban al registrar la venta.
          </p>
        </section>

        <aside aria-labelledby="sale-status" className="flex flex-col gap-4 rounded-md border border-border-translucent bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 id="sale-status" className="font-semibold">
              Estado
            </h2>
            <SaleStatusBadge status={sale.status} />
          </div>
          <ol className="flex flex-col gap-4">
            {timeline(sale).map(({ title, time, detail, Icon, tone }) => (
              <li key={title} className="flex gap-3">
                <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", tone)}>
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="flex min-w-0 flex-col text-sm">
                  <span>
                    <span className="font-medium">{title}</span>{" "}
                    <time dateTime={time} title={formatDateTime(time)} className="text-muted-foreground">
                      · {formatTime(time)}
                    </time>
                  </span>
                  {detail && <span className="text-muted-foreground break-words">{detail}</span>}
                </span>
              </li>
            ))}
          </ol>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 border-t border-border pt-4 text-sm">
            <dt className="text-muted-foreground">Cliente</dt>
            <dd>{sale.customerDescription ?? "Sin descripción"}</dd>
            <dt className="text-muted-foreground">Método de pago</dt>
            <dd>
              {sale.paymentMethod
                ? PAYMENT_METHOD_LABELS[sale.paymentMethod]
                : sale.status === "Cancelled"
                  ? "No se cobró"
                  : "Pendiente"}
            </dd>
            <dt className="text-muted-foreground">Registró</dt>
            <dd>{sale.cashierName}</dd>
          </dl>
          <SaleActions sale={sale} role={user.role} layout="detail" />
        </aside>
      </div>
    </>
  );
}

function SaleDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Cargando venta">
      <Skeleton className="h-8 w-56" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    </div>
  );
}

export default function SaleDetailPage({ params }: PageProps<"/sales/[id]">) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <Button asChild variant="ghost" size="sm" className="self-start text-muted-foreground">
        <Link href="/sales/pending">
          <ArrowLeftIcon />
          Pendientes
        </Link>
      </Button>
      <Suspense fallback={<SaleDetailSkeleton />}>
        <SaleDetail params={params} />
      </Suspense>
    </div>
  );
}
