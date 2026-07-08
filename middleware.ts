import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logger } from "@/lib/logger";

export function middleware(request: NextRequest) {
  const start = Date.now();
  const path = request.nextUrl.pathname;

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
  matcher: "/api/:path*",
};
