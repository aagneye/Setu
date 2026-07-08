import { ok } from "@/lib/api/response";
import { clearAuthCookieHeader } from "@/lib/auth/session";

export async function POST() {
  const response = ok({ success: true });
  response.headers.set("Set-Cookie", clearAuthCookieHeader());
  return response;
}
