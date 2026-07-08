import { badRequest, ok, serverError } from "@/lib/api/response";
import { getUserByEmail } from "@/lib/db/users";
import { verifyPassword } from "@/lib/auth/password";
import { validateLogin } from "@/lib/validators/auth";
import { authCookieHeader, createSessionToken } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const input = validateLogin(await request.json());
    if (!input) return badRequest("Invalid credentials");

    const user = await getUserByEmail(input.email);
    if (!user || !verifyPassword(input.password, user.password_hash)) {
      return badRequest("Invalid credentials");
    }

    const token = createSessionToken({
      user_id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    });

    const response = ok({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    });
    response.headers.set("Set-Cookie", authCookieHeader(token));
    return response;
  } catch (err) {
    return serverError(String(err));
  }
}
