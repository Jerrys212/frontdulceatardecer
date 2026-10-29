import "server-only";

import { apiFetch } from "@/data/client";
import { ExtraSchema } from "@/data/extras/types";

export async function getAllExtras() {
  const { data } = await apiFetch("/extras/all", ExtraSchema.array());
  return data;
}
