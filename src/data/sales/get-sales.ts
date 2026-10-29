import "server-only";

import { apiFetch } from "@/data/client";
import { SaleSchema } from "@/data/sales/types";

export async function getPendingSales() {
  const { data } = await apiFetch("/sales/pending", SaleSchema.array());
  return data;
}

export async function getSale(id: string) {
  const { data } = await apiFetch(`/sales/${id}`, SaleSchema);
  return data;
}
