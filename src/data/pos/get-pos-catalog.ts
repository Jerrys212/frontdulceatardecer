import "server-only";

import { cache } from "react";

import { ActiveCategorySchema } from "@/data/categories/types";
import { apiFetch } from "@/data/client";
import { ActiveExtraSchema } from "@/data/extras/types";
import { AvailableProductSchema } from "@/data/products/types";

export const getActiveCategories = cache(async () => {
  const { data } = await apiFetch("/categories", ActiveCategorySchema.array());
  return data;
});

export const getActiveExtras = cache(async () => {
  const { data } = await apiFetch("/extras", ActiveExtraSchema.array());
  return data;
});

type AvailableProductsFilter = {
  categoryId?: string;
  subcategoryId?: string;
  search?: string;
};

export async function getAvailableProducts({ categoryId, subcategoryId, search }: AvailableProductsFilter = {}) {
  const params = new URLSearchParams();
  if (categoryId) params.set("categoryId", categoryId);
  if (subcategoryId) params.set("subcategoryId", subcategoryId);
  if (search) params.set("search", search);
  const query = params.toString();
  const { data } = await apiFetch(query ? `/products?${query}` : "/products", AvailableProductSchema.array());
  return data;
}
