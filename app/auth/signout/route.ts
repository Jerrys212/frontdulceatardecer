import { NextResponse, type NextRequest } from "next/server";

import { LOGIN_PATH, SIGN_OUT_REASONS } from "@/lib/auth/routes";
import { clearSessionCookies } from "@/lib/auth/session";

export function GET(request: NextRequest) {
  const url = new URL(LOGIN_PATH, request.url);
  const reason = request.nextUrl.searchParams.get("reason");
  if (reason && reason in SIGN_OUT_REASONS) url.searchParams.set("reason", reason);

  const response = NextResponse.redirect(url);
  clearSessionCookies(response.cookies);
  return response;
}
