import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { ApiError } from "@/data/api-error";
import { requestApi, type RequestApiOptions } from "@/data/request-api";
import { CHANGE_PASSWORD_PATH, MUST_CHANGE_PASSWORD_MESSAGE, SIGN_OUT_PATH } from "@/lib/auth/routes";
import { ACCESS_COOKIE } from "@/lib/auth/session";
import type { ApiResult } from "@/types/api";

type ApiFetchOptions = Omit<RequestApiOptions, "accessToken" | "refreshToken">;

export async function apiFetch<T>(
  path: string,
  schema: z.ZodType<T>,
  options: ApiFetchOptions = {},
): Promise<ApiResult<T>> {
  const accessToken = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!accessToken) redirect(`${SIGN_OUT_PATH}?reason=expired`);

  try {
    return await requestApi(path, schema, { ...options, accessToken });
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.statusCode === 401) redirect(`${SIGN_OUT_PATH}?reason=expired`);
      if (error.statusCode === 403 && error.hasMessage(MUST_CHANGE_PASSWORD_MESSAGE)) {
        redirect(CHANGE_PASSWORD_PATH);
      }
    }
    throw error;
  }
}
