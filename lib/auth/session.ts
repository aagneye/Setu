import { createHmac } from "crypto";
import { AUTH_COOKIE, AUTH_SESSION_DAYS } from "@/lib/auth/constants";

export interface SessionPayload {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  exp: number;
}

function secret(): string {
  return process.env.AUTH_SECRET ?? "setu-dev-secret";
}

function signBase64(base: string): string {
  return createHmac("sha256", secret()).update(base).digest("base64url");
}

export function createSessionToken(
  input: Omit<SessionPayload, "exp">
): string {
  const exp = Math.floor(Date.now() / 1000) + AUTH_SESSION_DAYS * 24 * 60 * 60;
  const payload: SessionPayload = { ...input, exp };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = signBase64(body);
  return `${body}.${sig}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  if (signBase64(body) !== sig) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function authCookieHeader(token: string): string {
  const maxAge = AUTH_SESSION_DAYS * 24 * 60 * 60;
  return `${AUTH_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
}

export function clearAuthCookieHeader(): string {
  return `${AUTH_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
