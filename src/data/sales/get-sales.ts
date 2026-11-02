import "server-only";

import { notFound } from "next/navigation";

import { ApiError } from "@/data/api-error";
import { apiFetch } from "@/data/client";
import { SALES_PAGE_SIZE, SaleSchema, type SalesQuery } from "@/data/sales/types";
import { withQuery } from "@/lib/search-params";
import { PagedResultSchema } from "@/types/api";

const SalesPageSchema = PagedResultSchema(SaleSchema);

export async function getSales({ from, to, status, paymentMethod, cashierId, page }: SalesQuery) {
  const path = withQuery("/sales", {
    from,
    to,
    status,
    paymentMethod,
    cashierId,
    page: page ?? 1,
    pageSize: SALES_PAGE_SIZE,
  });
  const { data } = await apiFetch(path, SalesPageSchema);
  return data;
}

export async function getPendingSales() {
  const { data } = await apiFetch("/sales/pending", SaleSchema.array());
  return data;
}

export async function getSale(id: string) {
  try {
    const { data } = await apiFetch(`/sales/${id}`, SaleSchema);
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) notFound();
    throw error;
  }
}
