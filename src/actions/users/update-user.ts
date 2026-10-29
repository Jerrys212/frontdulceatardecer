"use server";

import { refresh } from "next/cache";

import { UpdateUserSchema, type UpdateUserInput } from "@/actions/users/schemas";
import { toActionFailure, validationFailure } from "@/actions/to-action-failure";
import { apiFetch } from "@/data/client";
import { UserIdSchema, UserSchema } from "@/data/users/types";
import type { ActionResult } from "@/types/api";

export async function updateUser(userId: string, input: UpdateUserInput): Promise<ActionResult> {
  const id = UserIdSchema.safeParse(userId);
  if (!id.success) return validationFailure(id.error);
  const parsed = UpdateUserSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  try {
    const { message } = await apiFetch(`/users/${id.data}`, UserSchema, { method: "PUT", body: parsed.data });
    refresh();
    return { success: true, message: message ?? "Usuario actualizado", data: null };
  } catch (error) {
    return toActionFailure(error, "updateUser");
  }
}
