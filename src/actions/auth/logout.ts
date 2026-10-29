"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { reportError } from "@/adapters/error-tracking";
import { requestApi } from "@/data/request-api";
import { LOGIN_PATH } from "@/lib/auth/routes";
import { ACCESS_COOKIE, REFRESH_COOKIE, clearSessionCookies } from "@/lib/auth/session";
import { EmptyDataSchema } from "@/types/api";

export async function logout() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (accessToken) {
    try {
      await requestApi("/auth/logout", EmptyDataSchema, { method: "POST", accessToken, refreshToken });
    } catch (error) {
      reportError(error, { scope: "logout" });
    }
  }

  clearSessionCookies(cookieStore);
  redirect(LOGIN_PATH);
}
