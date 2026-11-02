import { Suspense } from "react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { PaginationBar } from "@/components/pagination-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { requireAdmin } from "@/data/auth/require-role";
import {
  getBottomProducts,
  getCancellations,
  getCashiers,
  getHeatmap,
  getPaymentMethods,
  getSalesByCategory,
  getSalesOverTime,
  getSalesSummary,
  getTopExtras,
  getTopProducts,
} from "@/data/reports/get-reports";
import { ReportsQuerySchema, type ReportPeriod, type ReportsQuery } from "@/data/reports/types";
import { PAYMENT_METHOD_LABELS } from "@/data/sales/types";
import { getSellers } from "@/data/users/get-users";
import { CancellationsCashierFilter } from "@/features/reports/components/cancellations-cashier-filter";
import { CancellationsTable } from "@/features/reports/components/cancellations-table";
import { CashiersTable } from "@/features/reports/components/cashiers-table";
import { PeriodFilter } from "@/features/reports/components/period-filter";
import { ExtrasRankingTable, ProductsRankingTable } from "@/features/reports/components/ranking-tables";
import { NoSalesMessage, ReportPanel } from "@/features/reports/components/report-panel";
import { SalesHeatmap } from "@/features/reports/components/sales-heatmap";
import { SalesOverTimeChart } from "@/features/reports/components/sales-over-time-chart";
import { ShareBars } from "@/features/reports/components/share-bars";
import { SummaryTiles } from "@/features/reports/components/summary-tiles";
import { formatCurrency, formatNumber, todayIsoDate } from "@/lib/formats";
import { groupingFor, resolveReportPeriod } from "@/lib/report-period";
import { firstValue, withQuery } from "@/lib/search-params";

export const metadata: Metadata = {
  title: "Reportes",
};

type ResolvedQuery = { query: ReportsQuery; period: ReportPeriod; today: string };

async function resolveQuery(searchParams: PageProps<"/reports">["searchParams"]): Promise<ResolvedQuery> {
  await requireAdmin();
  const raw = await searchParams;
  const query = ReportsQuerySchema.parse({
    from: firstValue(raw.from),
    to: firstValue(raw.to),
    cancellationsCashier: firstValue(raw.cancellationsCashier),
    cancellationsPage: firstValue(raw.cancellationsPage),
  });
  const today = todayIsoDate();
  return { query, period: resolveReportPeriod(query.from, query.to, today), today };
}

type SectionProps = { resolved: Promise<ResolvedQuery> };

async function Filters({ resolved }: SectionProps) {
  const { period, today } = await resolved;
  return <PeriodFilter period={period} today={today} />;
}

async function Summary({ resolved }: SectionProps) {
  const { period } = await resolved;
  return <SummaryTiles summary={await getSalesSummary(period)} />;
}

async function SalesOverTime({ resolved }: SectionProps) {
  const { period } = await resolved;
  const grouping = groupingFor(period);
  return <SalesOverTimeChart intervals={await getSalesOverTime(period, grouping)} grouping={grouping} />;
}

async function PaymentMethods({ resolved }: SectionProps) {
  const { period } = await resolved;
  const methods = await getPaymentMethods(period);
  if (methods.every((method) => method.salesCount === 0)) return <NoSalesMessage />;
  return (
    <ShareBars
      items={[...methods]
        .sort((a, b) => b.amount - a.amount)
        .map((method) => ({
          key: method.method,
          label: PAYMENT_METHOD_LABELS[method.method],
          value: formatCurrency(method.amount),
          detail: `${formatNumber(method.salesCount)} ventas`,
          percentage: method.percentage,
        }))}
    />
  );
}

async function Categories({ resolved }: SectionProps) {
  const { period } = await resolved;
  const categories = await getSalesByCategory(period);
  if (categories.length === 0) return <NoSalesMessage />;
  return (
    <ShareBars
      items={categories.map((category) => ({
        key: category.name,
        label: category.name,
        value: formatCurrency(category.revenue),
        detail: `${formatNumber(category.units)} unidades`,
        percentage: category.revenuePercentage,
        children: category.subcategories.map((subcategory) => ({
          key: `${category.name}-${subcategory.name}`,
          label: subcategory.name,
          value: formatCurrency(subcategory.revenue),
          percentage: subcategory.revenuePercentage,
        })),
      }))}
    />
  );
}

async function TopProducts({ resolved }: SectionProps) {
  const { period } = await resolved;
  return (
    <ProductsRankingTable products={await getTopProducts(period)} emptyMessage="Sin productos vendidos en este periodo." />
  );
}

async function BottomProducts({ resolved }: SectionProps) {
  const { period } = await resolved;
  return <ProductsRankingTable products={await getBottomProducts(period)} emptyMessage="No hay productos activos." />;
}

async function TopExtras({ resolved }: SectionProps) {
  const { period } = await resolved;
  return <ExtrasRankingTable extras={await getTopExtras(period)} />;
}

async function Heatmap({ resolved }: SectionProps) {
  const { period } = await resolved;
  return <SalesHeatmap cells={await getHeatmap(period)} />;
}

async function Cashiers({ resolved }: SectionProps) {
  const { period } = await resolved;
  return <CashiersTable cashiers={await getCashiers(period)} />;
}

async function Cancellations({ resolved }: SectionProps) {
  const { query, period } = await resolved;
  const [result, sellers] = await Promise.all([
    getCancellations(period, query.cancellationsCashier, query.cancellationsPage ?? 1),
    getSellers(),
  ]);
  const hrefForPage = (page: number) =>
    withQuery("/reports", {
      from: query.from,
      to: query.to,
      cancellationsCashier: query.cancellationsCashier,
      cancellationsPage: page > 1 ? page : undefined,
    });

  return (
    <>
      <CancellationsCashierFilter sellers={sellers} />
      <div className="-mx-4 overflow-hidden border-y border-border">
        <CancellationsTable cancellations={result.items} />
      </div>
      {result.totalCount > 0 && (
        <PaginationBar
          page={result.page}
          pageSize={result.pageSize}
          itemCount={result.items.length}
          totalCount={result.totalCount}
          totalPages={result.totalPages}
          hrefForPage={hrefForPage}
        />
      )}
    </>
  );
}

function PanelSkeleton({ className = "h-48" }: { className?: string }) {
  return <Skeleton className={`w-full ${className}`} />;
}

export default function ReportsPage({ searchParams }: PageProps<"/reports">) {
  const resolved = resolveQuery(searchParams);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PageHeader
        title="Reportes"
        description="Solo cuentan ventas cobradas; las canceladas se muestran aparte. Montos con IVA incluido."
      />
      <Suspense fallback={<PanelSkeleton className="h-16" />}>
        <Filters resolved={resolved} />
      </Suspense>
      <Suspense fallback={<PanelSkeleton className="h-32" />}>
        <Summary resolved={resolved} />
      </Suspense>

      <ReportPanel id="report-over-time" title="Ingresos en el tiempo">
        <Suspense fallback={<PanelSkeleton className="h-56" />}>
          <SalesOverTime resolved={resolved} />
        </Suspense>
      </ReportPanel>

      <div className="grid gap-6 lg:grid-cols-2">
        <ReportPanel id="report-payment-methods" title="Métodos de pago">
          <Suspense fallback={<PanelSkeleton />}>
            <PaymentMethods resolved={resolved} />
          </Suspense>
        </ReportPanel>
        <ReportPanel
          id="report-categories"
          title="Ventas por categoría"
          description="Los porcentajes de subcategoría son sobre el total del periodo."
        >
          <Suspense fallback={<PanelSkeleton />}>
            <Categories resolved={resolved} />
          </Suspense>
        </ReportPanel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ReportPanel id="report-top-products" title="Más vendidos" description="Por ingresos.">
          <Suspense fallback={<PanelSkeleton className="h-64" />}>
            <TopProducts resolved={resolved} />
          </Suspense>
        </ReportPanel>
        <ReportPanel
          id="report-bottom-products"
          title="Menos vendidos"
          description="Productos activos, incluidos los que no se vendieron."
        >
          <Suspense fallback={<PanelSkeleton className="h-64" />}>
            <BottomProducts resolved={resolved} />
          </Suspense>
        </ReportPanel>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <ReportPanel id="report-extras" title="Extras más pedidos">
          <Suspense fallback={<PanelSkeleton className="h-64" />}>
            <TopExtras resolved={resolved} />
          </Suspense>
        </ReportPanel>
        <ReportPanel id="report-heatmap" title="Horas con más ventas" description="Ventas cobradas por día y hora.">
          <Suspense fallback={<PanelSkeleton className="h-64" />}>
            <Heatmap resolved={resolved} />
          </Suspense>
        </ReportPanel>
      </div>

      <ReportPanel
        id="report-cashiers"
        title="Desempeño por usuario"
        description="Ventas a quien cobró, cancelaciones a quien canceló y reducciones a quien modificó. Se marcan en rojo cuando superan el 10 % de sus ventas."
      >
        <Suspense fallback={<PanelSkeleton />}>
          <Cashiers resolved={resolved} />
        </Suspense>
      </ReportPanel>

      <ReportPanel id="report-cancellations" title="Cancelaciones" description="De la más reciente a la más antigua.">
        <Suspense fallback={<PanelSkeleton />}>
          <Cancellations resolved={resolved} />
        </Suspense>
      </ReportPanel>
    </div>
  );
}
