import "server-only";

import { redirect } from "next/navigation";

import { getCurrentUser } from "@/data/auth/get-current-user";
import { getHomePath } from "@/lib/auth/routes";

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (user.role !== "Admin") redirect(getHomePath(user.role));
  return user;
}
