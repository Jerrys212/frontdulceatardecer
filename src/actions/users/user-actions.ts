"use server";

import { runMutation, toActionFailure, validationFailure } from "@/actions/action-result";
import { CreateUserSchema, UpdateUserSchema, type CreateUserInput, type UpdateUserInput } from "@/actions/users/schemas";
import { apiFetch } from "@/data/client";
import { CreateUserResponseSchema, SessionSchema, TemporaryPasswordSchema, UserSchema, type Session } from "@/data/users/types";
import { EntityIdSchema } from "@/lib/validations/ids";
import { EmptyDataSchema, type ActionResult } from "@/types/api";

type TemporaryPasswordResult = ActionResult<{ temporaryPassword: string }>;

export async function createUser(
  input: CreateUserInput,
): Promise<ActionResult<{ fullName: string; temporaryPassword: string }>> {
  const parsed = CreateUserSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  return runMutation(
    "createUser",
    "Usuario creado",
    () => apiFetch("/users", CreateUserResponseSchema, { method: "POST", body: parsed.data }),
    (data) => ({ fullName: data.user.fullName, temporaryPassword: data.temporaryPassword }),
  );
}

export async function updateUser(userId: string, input: UpdateUserInput): Promise<ActionResult> {
  const id = EntityIdSchema.safeParse(userId);
  if (!id.success) return validationFailure(id.error);
  const parsed = UpdateUserSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  return runMutation("updateUser", "Usuario actualizado", () =>
    apiFetch(`/users/${id.data}`, UserSchema, { method: "PUT", body: parsed.data }),
  );
}

export async function deactivateUser(userId: string): Promise<ActionResult> {
  const id = EntityIdSchema.safeParse(userId);
  if (!id.success) return validationFailure(id.error);

  return runMutation("deactivateUser", "Usuario desactivado", () =>
    apiFetch(`/users/${id.data}/deactivate`, EmptyDataSchema, { method: "POST" }),
  );
}

export async function reactivateUser(userId: string): Promise<TemporaryPasswordResult> {
  const id = EntityIdSchema.safeParse(userId);
  if (!id.success) return validationFailure(id.error);

  return runMutation(
    "reactivateUser",
    "Usuario reactivado",
    () => apiFetch(`/users/${id.data}/reactivate`, TemporaryPasswordSchema, { method: "POST" }),
    (data) => data,
  );
}

export async function resetUserPassword(userId: string): Promise<TemporaryPasswordResult> {
  const id = EntityIdSchema.safeParse(userId);
  if (!id.success) return validationFailure(id.error);

  return runMutation(
    "resetUserPassword",
    "Contraseña restablecida",
    () => apiFetch(`/users/${id.data}/reset-password`, TemporaryPasswordSchema, { method: "POST" }),
    (data) => data,
  );
}

export async function getUserSessions(userId: string): Promise<ActionResult<Session[]>> {
  const id = EntityIdSchema.safeParse(userId);
  if (!id.success) return validationFailure(id.error);

  try {
    const { data } = await apiFetch(`/users/${id.data}/sessions`, SessionSchema.array());
    return { success: true, message: "", data };
  } catch (error) {
    return toActionFailure(error, "getUserSessions");
  }
}

export async function revokeUserSessions(userId: string): Promise<ActionResult> {
  const id = EntityIdSchema.safeParse(userId);
  if (!id.success) return validationFailure(id.error);

  try {
    const { message } = await apiFetch(`/users/${id.data}/sessions/revoke`, EmptyDataSchema, { method: "POST" });
    return { success: true, message: message ?? "Sesiones cerradas", data: null };
  } catch (error) {
    return toActionFailure(error, "revokeUserSessions");
  }
}
