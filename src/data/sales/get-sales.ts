import "server-only";

import { notFound } from "next/navigation";

import { ApiError } from "@/data/api-error";
import { apiFetch } from "@/data/client";
import { SaleSchema } from "@/data/sales/types";

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
