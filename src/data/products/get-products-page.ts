import "server-only";

import { apiFetch } from "@/data/client";
import { ProductSchema, type ProductsQuery } from "@/data/products/types";
import { paginate } from "@/lib/pagination";

export async function getProductsPage({ search, category, subcategory, status, page }: ProductsQuery) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (category) params.set("categoryId", category);
  if (subcategory) params.set("subcategoryId", subcategory);
  if (status) params.set("isActive", String(status === "active"));

  const query = params.toString();
  const { data } = await apiFetch(query ? `/products/all?${query}` : "/products/all", ProductSchema.array());
  // The API returns the whole catalog; paginate here until /products/all accepts page and pageSize.
  return paginate(data, page);
}
