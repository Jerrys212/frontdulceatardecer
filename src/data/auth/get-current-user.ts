import "server-only";

import { cache } from "react";

import { CurrentUserSchema } from "@/data/auth/types";
import { apiFetch } from "@/data/client";

export const getCurrentUser = cache(async () => {
  const { data } = await apiFetch("/auth/me", CurrentUserSchema);
  return data;
});
