import "server-only";

import { CategorySchema } from "@/data/categories/types";
import { apiFetch } from "@/data/client";

export async function getAllCategories() {
  const { data } = await apiFetch("/categories/all", CategorySchema.array());
  return data;
}
