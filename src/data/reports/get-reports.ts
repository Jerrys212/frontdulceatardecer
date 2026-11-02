import "server-only";

import { apiFetch } from "@/data/client";
import {
  CANCELLATIONS_PAGE_SIZE,
  CancellationSchema,
  CashierPerformanceSchema,
  CategorySalesSchema,
  ExtraSalesSchema,
  HeatmapCellSchema,
  MyDaySchema,
  PaymentMethodSalesSchema,
  ProductSalesSchema,
  RANKING_LIMIT,
  SalesIntervalSchema,
  SalesSummarySchema,
  type ReportGrouping,
  type ReportPeriod,
} from "@/data/reports/types";
import { withQuery } from "@/lib/search-params";
import { PagedResultSchema } from "@/types/api";

const CancellationsPageSchema = PagedResultSchema(CancellationSchema);

export async function getSalesSummary(period: ReportPeriod) {
  const { data } = await apiFetch(withQuery("/reports/summary", period), SalesSummarySchema);
  return data;
}

export async function getSalesOverTime(period: ReportPeriod, groupBy: ReportGrouping) {
  const { data } = await apiFetch(
    withQuery("/reports/sales-over-time", { ...period, groupBy }),
    SalesIntervalSchema.array(),
  );
  return data;
}

export async function getTopProducts(period: ReportPeriod) {
  const { data } = await apiFetch(
    withQuery("/reports/top-products", { ...period, limit: RANKING_LIMIT, orderBy: "revenue" }),
    ProductSalesSchema.array(),
  );
  return data;
}

export async function getBottomProducts(period: ReportPeriod) {
  const { data } = await apiFetch(
    withQuery("/reports/bottom-products", { ...period, limit: RANKING_LIMIT }),
    ProductSalesSchema.array(),
  );
  return data;
}

export async function getSalesByCategory(period: ReportPeriod) {
  const { data } = await apiFetch(withQuery("/reports/sales-by-category", period), CategorySalesSchema.array());
  return data;
}

export async function getTopExtras(period: ReportPeriod) {
  const { data } = await apiFetch(
    withQuery("/reports/top-extras", { ...period, limit: RANKING_LIMIT }),
    ExtraSalesSchema.array(),
  );
  return data;
}

export async function getPaymentMethods(period: ReportPeriod) {
  const { data } = await apiFetch(withQuery("/reports/payment-methods", period), PaymentMethodSalesSchema.array());
  return data;
}

export async function getHeatmap(period: ReportPeriod) {
  const { data } = await apiFetch(withQuery("/reports/heatmap", period), HeatmapCellSchema.array());
  return data;
}

export async function getCashiers(period: ReportPeriod) {
  const { data } = await apiFetch(withQuery("/reports/cashiers", period), CashierPerformanceSchema.array());
  return data;
}

export async function getCancellations(period: ReportPeriod, cashierId: string | undefined, page: number) {
  const { data } = await apiFetch(
    withQuery("/reports/cancellations", { ...period, cashierId, page, pageSize: CANCELLATIONS_PAGE_SIZE }),
    CancellationsPageSchema,
  );
  return data;
}

export async function getMyDay() {
  const { data } = await apiFetch("/reports/my-day", MyDaySchema);
  return data;
}
