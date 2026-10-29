"use server";

import { refresh } from "next/cache";

import { CreateUserSchema, type CreateUserInput } from "@/actions/users/schemas";
import { toActionFailure, validationFailure } from "@/actions/to-action-failure";
import { apiFetch } from "@/data/client";
import { CreateUserResponseSchema } from "@/data/users/types";
import type { ActionResult } from "@/types/api";

export async function createUser(
  input: CreateUserInput,
): Promise<ActionResult<{ fullName: string; temporaryPassword: string }>> {
  const parsed = CreateUserSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  try {
    const { data, message } = await apiFetch("/users", CreateUserResponseSchema, {
      method: "POST",
      body: parsed.data,
    });
    refresh();
    return {
      success: true,
      message: message ?? "Usuario creado",
      data: { fullName: data.user.fullName, temporaryPassword: data.temporaryPassword },
    };
  } catch (error) {
    return toActionFailure(error, "createUser");
  }
}
