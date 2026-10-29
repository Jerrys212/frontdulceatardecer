import "server-only";

import { cache } from "react";

import { CategorySchema } from "@/data/categories/types";
import { apiFetch } from "@/data/client";

export const getAllCategories = cache(async () => {
  const { data } = await apiFetch("/categories/all", CategorySchema.array());
  return data;
});
