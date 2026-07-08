import { notFound, ok, unauthorized } from "@/lib/api/response";
import { AUTH_COOKIE } from "@/lib/auth/constants";
import { verifySessionToken } from "@/lib/auth/session";
import { getUserById } from "@/lib/db/users";

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookie = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${AUTH_COOKIE}=`));
  const token = cookie?.split("=")[1];
  if (!token) return unauthorized();

  const session = verifySessionToken(token);
  if (!session) return unauthorized();

  const user = await getUserById(session.user_id);
  if (!user) return notFound("User not found");

  return ok({
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
  });
}
