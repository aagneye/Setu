import { UnauthorizedError } from "@/lib/errors";

export function verifyCronAuth(request: Request): void {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return;

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${cronSecret}`) return;

  const url = new URL(request.url);
  const secretParam = url.searchParams.get("secret");
  if (secretParam === cronSecret) return;

  throw new UnauthorizedError();
}
