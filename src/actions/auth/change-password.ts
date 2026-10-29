"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ChangePasswordSchema, type ChangePasswordInput } from "@/actions/auth/schemas";
import { toActionFailure, validationFailure } from "@/actions/action-result";
import { reportError } from "@/adapters/error-tracking";
import { apiFetch } from "@/data/client";
import { SIGN_OUT_PATH } from "@/lib/auth/routes";
import { REFRESH_COOKIE, applySessionCookies, refreshSession } from "@/lib/auth/session";
import { EmptyDataSchema, type ActionResult } from "@/types/api";

export async function changePassword(input: ChangePasswordInput): Promise<ActionResult> {
  const parsed = ChangePasswordSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  const { currentPassword, newPassword } = parsed.data;
  let message: string | null;
  try {
    ({ message } = await apiFetch("/auth/change-password", EmptyDataSchema, {
      method: "POST",
      body: { currentPassword, newPassword },
    }));
  } catch (error) {
    return toActionFailure(error, "changePassword");
  }

  // The current access token still carries the pending-change flag; a refresh issues one without it.
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) redirect(`${SIGN_OUT_PATH}?reason=expired`);
  try {
    applySessionCookies(cookieStore, await refreshSession(refreshToken));
  } catch (error) {
    reportError(error, { scope: "changePassword:refresh" });
    redirect(`${SIGN_OUT_PATH}?reason=expired`);
  }

  return { success: true, message: message ?? "Contraseña actualizada", data: null };
}
