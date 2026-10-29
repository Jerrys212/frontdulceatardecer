import "server-only";

import { redirect } from "next/navigation";

import { getCurrentUser } from "@/data/auth/get-current-user";
import type { Role } from "@/data/auth/types";
import { getHomePath } from "@/lib/auth/routes";

export async function requireRole(roles: Role[]) {
  const user = await getCurrentUser();
  if (!roles.includes(user.role)) redirect(getHomePath(user.role));
  return user;
}

export async function requireAdmin() {
  return requireRole(["Admin"]);
}
