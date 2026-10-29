"use server";

import { refresh } from "next/cache";

import { toActionFailure, validationFailure } from "@/actions/to-action-failure";
import { EmptyDataSchema } from "@/data/auth/types";
import { apiFetch } from "@/data/client";
import { SessionSchema, TemporaryPasswordSchema, UserIdSchema, type Session } from "@/data/users/types";
import type { ActionResult } from "@/types/api";

export async function deactivateUser(userId: string): Promise<ActionResult> {
  const id = UserIdSchema.safeParse(userId);
  if (!id.success) return validationFailure(id.error);

  try {
    const { message } = await apiFetch(`/users/${id.data}/deactivate`, EmptyDataSchema, { method: "POST" });
    refresh();
    return { success: true, message: message ?? "Usuario desactivado", data: null };
  } catch (error) {
    return toActionFailure(error, "deactivateUser");
  }
}

export async function reactivateUser(userId: string): Promise<ActionResult<{ temporaryPassword: string }>> {
  const id = UserIdSchema.safeParse(userId);
  if (!id.success) return validationFailure(id.error);

  try {
    const { data, message } = await apiFetch(`/users/${id.data}/reactivate`, TemporaryPasswordSchema, {
      method: "POST",
    });
    refresh();
    return { success: true, message: message ?? "Usuario reactivado", data };
  } catch (error) {
    return toActionFailure(error, "reactivateUser");
  }
}

export async function resetUserPassword(userId: string): Promise<ActionResult<{ temporaryPassword: string }>> {
  const id = UserIdSchema.safeParse(userId);
  if (!id.success) return validationFailure(id.error);

  try {
    const { data, message } = await apiFetch(`/users/${id.data}/reset-password`, TemporaryPasswordSchema, {
      method: "POST",
    });
    refresh();
    return { success: true, message: message ?? "Contraseña restablecida", data };
  } catch (error) {
    return toActionFailure(error, "resetUserPassword");
  }
}

export async function getUserSessions(userId: string): Promise<ActionResult<Session[]>> {
  const id = UserIdSchema.safeParse(userId);
  if (!id.success) return validationFailure(id.error);

  try {
    const { data } = await apiFetch(`/users/${id.data}/sessions`, SessionSchema.array());
    return { success: true, message: "", data };
  } catch (error) {
    return toActionFailure(error, "getUserSessions");
  }
}

export async function revokeUserSessions(userId: string): Promise<ActionResult> {
  const id = UserIdSchema.safeParse(userId);
  if (!id.success) return validationFailure(id.error);

  try {
    const { message } = await apiFetch(`/users/${id.data}/sessions/revoke`, EmptyDataSchema, { method: "POST" });
    return { success: true, message: message ?? "Sesiones cerradas", data: null };
  } catch (error) {
    return toActionFailure(error, "revokeUserSessions");
  }
}
