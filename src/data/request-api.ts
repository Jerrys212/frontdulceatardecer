import { z } from "zod";

import { reportError } from "@/adapters/error-tracking";
import { ApiError, fallbackMessage } from "@/data/api-error";
import { env } from "@/lib/env";
import { ApiEnvelopeSchema, type ApiResult } from "@/types/api";

export type RequestApiOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  accessToken?: string;
  refreshToken?: string;
  headers?: Record<string, string>;
};

export async function requestApi<T>(
  path: string,
  schema: z.ZodType<T>,
  { method = "GET", body, accessToken, refreshToken, headers: extraHeaders }: RequestApiOptions = {},
): Promise<ApiResult<T>> {
  const headers = new Headers({ Accept: "application/json", ...extraHeaders });
  if (body !== undefined) headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  if (refreshToken) headers.set("Cookie", `refresh_token=${refreshToken}`);

  let response: Response;
  try {
    response = await fetch(`${env.API_URL}/api/v1${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
  } catch (error) {
    reportError(error, { scope: "requestApi", path, method });
    throw new ApiError(503, fallbackMessage(503), ["Revisa que el servidor esté disponible e intenta de nuevo"]);
  }

  const json: unknown = await response.json().catch(() => null);
  const envelope = ApiEnvelopeSchema.safeParse(json);

  if (!envelope.success) {
    if (!response.ok) {
      const message = fallbackMessage(response.status);
      throw new ApiError(response.status, message, [message]);
    }
    reportError(envelope.error, { scope: "requestApi:envelope", path, method });
    throw new ApiError(502, fallbackMessage(502), [fallbackMessage(502)]);
  }

  const { success, message, data, errors } = envelope.data;

  if (!response.ok || !success) {
    const resolvedMessage = message ?? errors[0] ?? fallbackMessage(response.status);
    throw new ApiError(response.status, resolvedMessage, errors.length > 0 ? errors : [resolvedMessage], data);
  }

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    reportError(parsed.error, { scope: "requestApi:data", path, method });
    throw new ApiError(502, fallbackMessage(502), [fallbackMessage(502)]);
  }

  return { data: parsed.data, message, headers: response.headers };
}
