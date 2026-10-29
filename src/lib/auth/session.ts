import { z } from "zod";

import { TokenResponseSchema, type TokenResponse } from "@/data/auth/types";
import { requestApi } from "@/data/request-api";
import { env } from "@/lib/env";

export const ACCESS_COOKIE = "da_access";
export const REFRESH_COOKIE = "da_refresh";

const BACKEND_REFRESH_COOKIE = "refresh_token";
const SESSION_FALLBACK_MS = 12 * 60 * 60 * 1000;
const REFRESH_MARGIN_MS = 60 * 1000;

export type SessionTokens = {
  accessToken: string;
  accessExpiresAt: Date;
  refreshToken: string | null;
  refreshExpiresAt: Date;
};

type SessionCookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  path: string;
  expires: Date;
};

export type SessionCookieStore = {
  set(name: string, value: string, options: SessionCookieOptions): unknown;
  delete(name: string): unknown;
};

function cookieOptions(expires: Date): SessionCookieOptions {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  };
}

function readBackendRefreshCookie(headers: Headers) {
  for (const raw of headers.getSetCookie()) {
    const [pair, ...attributes] = raw.split(";").map((part) => part.trim());
    const separator = pair.indexOf("=");
    if (pair.slice(0, separator) !== BACKEND_REFRESH_COOKIE) continue;

    const value = pair.slice(separator + 1);
    if (!value) return null;

    let expiresAt = new Date(Date.now() + SESSION_FALLBACK_MS);
    for (const attribute of attributes) {
      const [key, attributeValue = ""] = attribute.split("=");
      if (key.toLowerCase() === "max-age") {
        expiresAt = new Date(Date.now() + Number(attributeValue) * 1000);
      } else if (key.toLowerCase() === "expires" && !Number.isNaN(Date.parse(attributeValue))) {
        expiresAt = new Date(attributeValue);
      }
    }
    return { value, expiresAt };
  }
  return null;
}

export function toSessionTokens(tokens: TokenResponse, headers: Headers): SessionTokens {
  const refresh = readBackendRefreshCookie(headers);
  return {
    accessToken: tokens.accessToken,
    accessExpiresAt: new Date(tokens.expiresAt),
    refreshToken: refresh?.value ?? null,
    refreshExpiresAt: refresh?.expiresAt ?? new Date(Date.now() + SESSION_FALLBACK_MS),
  };
}

export function applySessionCookies(store: SessionCookieStore, tokens: SessionTokens) {
  store.set(ACCESS_COOKIE, tokens.accessToken, cookieOptions(tokens.accessExpiresAt));
  if (tokens.refreshToken) {
    store.set(REFRESH_COOKIE, tokens.refreshToken, cookieOptions(tokens.refreshExpiresAt));
  }
}

export function forwardSessionToRequest(requestCookies: { set(name: string, value: string): unknown }, tokens: SessionTokens) {
  requestCookies.set(ACCESS_COOKIE, tokens.accessToken);
  if (tokens.refreshToken) requestCookies.set(REFRESH_COOKIE, tokens.refreshToken);
}

export function clearSessionCookies(store: SessionCookieStore) {
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

const JwtPayloadSchema = z.object({ exp: z.number() });

export function isAccessTokenFresh(token: string | undefined) {
  if (!token) return false;
  const payload = token.split(".")[1];
  if (!payload) return false;
  try {
    const parsed = JwtPayloadSchema.safeParse(JSON.parse(Buffer.from(payload, "base64url").toString("utf8")));
    return parsed.success && parsed.data.exp * 1000 - REFRESH_MARGIN_MS > Date.now();
  } catch {
    return false;
  }
}

// Parallel requests (prefetches, tabs) share one refresh so the rotating refresh token is only spent once.
const inflightRefreshes = new Map<string, Promise<SessionTokens>>();

export function refreshSession(refreshToken: string): Promise<SessionTokens> {
  const pending = inflightRefreshes.get(refreshToken);
  if (pending) return pending;

  const request = requestApi("/auth/refresh", TokenResponseSchema, {
    method: "POST",
    refreshToken,
    headers: { "X-Requested-With": "XMLHttpRequest" },
  })
    .then(({ data, headers }) => toSessionTokens(data, headers))
    .finally(() => {
      setTimeout(() => inflightRefreshes.delete(refreshToken), 10_000);
    });

  inflightRefreshes.set(refreshToken, request);
  return request;
}
