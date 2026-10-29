import { NextResponse, type NextRequest } from "next/server";

import { ApiError } from "@/data/api-error";
import { LOGIN_PATH, PUBLIC_PATHS, SIGN_OUT_PATH, type SignOutReason } from "@/lib/auth/routes";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  applySessionCookies,
  clearSessionCookies,
  forwardSessionToRequest,
  isAccessTokenFresh,
  refreshSession,
} from "@/lib/auth/session";

function redirectTo(request: NextRequest, pathname: string, reason?: SignOutReason) {
  const url = new URL(pathname, request.url);
  if (reason) url.searchParams.set("reason", reason);
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === SIGN_OUT_PATH) return NextResponse.next();

  const isPublic = PUBLIC_PATHS.includes(pathname);
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  if (isAccessTokenFresh(accessToken)) {
    return isPublic ? redirectTo(request, "/") : NextResponse.next();
  }

  if (!refreshToken) {
    return isPublic ? NextResponse.next() : redirectTo(request, LOGIN_PATH);
  }

  try {
    const tokens = await refreshSession(refreshToken);
    if (isPublic) {
      const response = redirectTo(request, "/");
      applySessionCookies(response.cookies, tokens);
      return response;
    }
    forwardSessionToRequest(request.cookies, tokens);
    const response = NextResponse.next({ request: { headers: request.headers } });
    applySessionCookies(response.cookies, tokens);
    return response;
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 401) {
      const response = isPublic ? NextResponse.next() : redirectTo(request, LOGIN_PATH, "expired");
      clearSessionCookies(response.cookies);
      return response;
    }
    return isPublic ? NextResponse.next() : redirectTo(request, LOGIN_PATH, "unavailable");
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
