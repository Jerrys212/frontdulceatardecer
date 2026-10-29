"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { LoginSchema, type LoginInput } from "@/actions/auth/schemas";
import { toActionFailure, validationFailure } from "@/actions/to-action-failure";
import { LoginResponseSchema } from "@/data/auth/types";
import { requestApi } from "@/data/request-api";
import { CHANGE_PASSWORD_PATH, getHomePath } from "@/lib/auth/routes";
import { applySessionCookies, toSessionTokens } from "@/lib/auth/session";
import type { ActionFailure } from "@/types/api";

export async function login(input: LoginInput): Promise<ActionFailure> {
  const parsed = LoginSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  let destination: string;
  try {
    const { data, headers } = await requestApi("/auth/login", LoginResponseSchema, {
      method: "POST",
      body: parsed.data,
    });
    applySessionCookies(await cookies(), toSessionTokens(data, headers));
    destination = data.user.mustChangePassword ? CHANGE_PASSWORD_PATH : getHomePath(data.user.role);
  } catch (error) {
    return toActionFailure(error, "login");
  }

  redirect(destination);
}
