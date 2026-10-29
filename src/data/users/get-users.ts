import "server-only";

import { apiFetch } from "@/data/client";
import { USERS_PAGE_SIZE, UserSchema, type UsersQuery } from "@/data/users/types";
import { PagedResultSchema } from "@/types/api";

const UsersPageSchema = PagedResultSchema(UserSchema);

export async function getUsers({ search, role, status, page }: UsersQuery) {
  const params = new URLSearchParams({ page: String(page ?? 1), pageSize: String(USERS_PAGE_SIZE) });
  if (search) params.set("search", search);
  if (role) params.set("role", role);
  if (status) params.set("isActive", String(status === "active"));

  const { data } = await apiFetch(`/users?${params}`, UsersPageSchema);
  return data;
}
