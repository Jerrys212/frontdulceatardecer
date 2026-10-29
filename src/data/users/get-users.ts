import "server-only";

import { apiFetch } from "@/data/client";
import { USERS_PAGE_SIZE, UserSchema, type UsersQuery } from "@/data/users/types";
import { withQuery } from "@/lib/search-params";
import { isActiveParam } from "@/lib/validations/status";
import { PagedResultSchema } from "@/types/api";

const UsersPageSchema = PagedResultSchema(UserSchema);

export async function getUsers({ search, role, status, page }: UsersQuery) {
  const path = withQuery("/users", {
    page: page ?? 1,
    pageSize: USERS_PAGE_SIZE,
    search,
    role,
    isActive: isActiveParam(status),
  });
  const { data } = await apiFetch(path, UsersPageSchema);
  return data;
}
