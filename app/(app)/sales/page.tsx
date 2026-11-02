import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { PaginationBar } from "@/components/pagination-bar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { requireAdmin } from "@/data/auth/require-role";
import { getSales } from "@/data/sales/get-sales";
import { SalesQuerySchema, type SalesQuery } from "@/data/sales/types";
import { getSellers } from "@/data/users/get-users";
import { SalesFilters } from "@/features/sales/components/sales-filters";
import { SalesTable } from "@/features/sales/components/sales-table";
import { todayIsoDate } from "@/lib/formats";
import { firstValue, withQuery } from "@/lib/search-params";

export const metadata: Metadata = {
  title: "Ventas",
};

type SearchParams = PageProps<"/sales">["searchParams"];

function buildSalesHref(query: SalesQuery, page: number) {
  return withQuery("/sales", { ...query, page: page > 1 ? page : undefined });
}

async function parseQuery(searchParams: SearchParams): Promise<SalesQuery> {
  const raw = await searchParams;
  const query = SalesQuerySchema.parse({
    from: firstValue(raw.from),
    to: firstValue(raw.to),
    status: firstValue(raw.status),
    paymentMethod: firstValue(raw.paymentMethod),
    cashierId: firstValue(raw.cashierId),
    page: firstValue(raw.page),
  });
  const today = todayIsoDate();
  const from = query.from ?? today;
  const to = query.to ?? today;
  return from > to ? { ...query, from: to, to: from } : query;
}

async function Filters() {
  await requireAdmin();
  const sellers = await getSellers();
  return <SalesFilters today={todayIsoDate()} sellers={sellers} />;
}

async function SalesSection({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const query = await parseQuery(searchParams);
  const result = await getSales(query);
  const hasFilters = Boolean(query.from || query.to || query.status || query.paymentMethod || query.cashierId);

  return (
    <section aria-label="Lista de ventas" className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-md border border-border-translucent bg-card">
        {result.items.length > 0 ? (
          <SalesTable sales={result.items} />
        ) : (
          <EmptyState
            title={result.totalCount > 0 ? "Esta página ya no tiene ventas" : "No hay ventas en este periodo"}
            description={
              hasFilters
                ? "Prueba con otras fechas o quita los filtros."
                : "Las ventas registradas hoy aparecerán aquí."
            }
          >
            {(hasFilters || result.totalCount > 0) && (
              <Button asChild variant="outline" size="sm">
                <Link href={result.totalCount > 0 ? buildSalesHref(query, 1) : "/sales"}>
                  {result.totalCount > 0 ? "Ir a la primera página" : "Ver ventas de hoy"}
                </Link>
              </Button>
            )}
          </EmptyState>
        )}
      </div>
      <PaginationBar
        page={result.page}
        pageSize={result.pageSize}
        itemCount={result.items.length}
        totalCount={result.totalCount}
        totalPages={result.totalPages}
        hrefForPage={(page) => buildSalesHref(query, page)}
      />
    </section>
  );
}

function SalesSectionSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border-translucent bg-card p-4" aria-busy="true" aria-label="Cargando ventas">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}

export default function SalesPage({ searchParams }: PageProps<"/sales">) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PageHeader title="Ventas" description="Historial de ventas registradas. Por defecto muestra las de hoy." />
      <Suspense fallback={<Skeleton className="h-16 w-full" />}>
        <Filters />
      </Suspense>
      <Suspense fallback={<SalesSectionSkeleton />}>
        <SalesSection searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
