import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logger } from "@/lib/logger";
import { AUTH_COOKIE } from "@/lib/auth/constants";

const AUTH_ROUTES = ["/login", "/signup"];
const PROTECTED_PREFIXES = ["/dashboard"];

function hasAuthCookie(request: NextRequest): boolean {
  return Boolean(request.cookies.get(AUTH_COOKIE)?.value);
}

export function middleware(request: NextRequest) {
  const start = Date.now();
  const path = request.nextUrl.pathname;
  const authed = hasAuthCookie(request);

  const isAuthRoute = AUTH_ROUTES.some((r) => path === r);
  const isProtected = PROTECTED_PREFIXES.some((p) => path.startsWith(p));

  if (isProtected && !authed) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && authed) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (path.startsWith("/api/")) {
    logger.info("API request", {
      pipeline: "middleware",
      event: "request",
      path,
      method: request.method,
    });
  }

  const response = NextResponse.next();
  response.headers.set("x-setu-version", "1.0.0-mvp");
  response.headers.set("x-response-time", `${Date.now() - start}ms`);
  return response;
}

export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*", "/login", "/signup"],
};
