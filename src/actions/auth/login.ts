"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { LoginSchema, type LoginInput } from "@/actions/auth/schemas";
import { toActionFailure, validationFailure } from "@/actions/action-result";
import { LoginResponseSchema } from "@/data/auth/types";
import { requestApi } from "@/data/request-api";
import { CHANGE_PASSWORD_PATH, getHomePath } from "@/lib/auth/routes";
import { applySessionCookies, toSessionTokens } from "@/lib/auth/session";
import type { ActionFailure } from "@/types/api";

// Without this the backend records Next's server as the device of every session.
async function clientIdentityHeaders() {
  const incoming = await headers();
  const forwarded: Record<string, string> = {};
  const userAgent = incoming.get("user-agent");
  const forwardedFor = incoming.get("x-forwarded-for");
  if (userAgent) forwarded["User-Agent"] = userAgent;
  if (forwardedFor) forwarded["X-Forwarded-For"] = forwardedFor;
  return forwarded;
}

export async function login(input: LoginInput): Promise<ActionFailure> {
  const parsed = LoginSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error);

  let destination: string;
  try {
    const { data, headers } = await requestApi("/auth/login", LoginResponseSchema, {
      method: "POST",
      body: parsed.data,
      headers: await clientIdentityHeaders(),
    });
    applySessionCookies(await cookies(), toSessionTokens(data, headers));
    destination = data.user.mustChangePassword ? CHANGE_PASSWORD_PATH : getHomePath(data.user.role);
  } catch (error) {
    return toActionFailure(error, "login");
  }

  redirect(destination);
}
