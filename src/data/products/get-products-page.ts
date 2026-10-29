import "server-only";

import { apiFetch } from "@/data/client";
import { ProductSchema, type ProductsQuery } from "@/data/products/types";
import { paginate } from "@/lib/pagination";
import { withQuery } from "@/lib/search-params";
import { isActiveParam } from "@/lib/validations/status";

export async function getProductsPage({ search, category, subcategory, status, page }: ProductsQuery) {
  const path = withQuery("/products/all", {
    search,
    categoryId: category,
    subcategoryId: subcategory,
    isActive: isActiveParam(status),
  });
  const { data } = await apiFetch(path, ProductSchema.array());
  // The API returns the whole catalog; paginate here until /products/all accepts page and pageSize.
  return paginate(data, page);
}
