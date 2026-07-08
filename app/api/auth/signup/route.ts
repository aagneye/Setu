import { badRequest, created, serverError } from "@/lib/api/response";
import { createUser, getUserByEmail } from "@/lib/db/users";
import { hashPassword } from "@/lib/auth/password";
import { validateSignup } from "@/lib/validators/auth";
import { AUTH_DEFAULT_ROLE } from "@/lib/auth/constants";

export async function POST(request: Request) {
  try {
    const input = validateSignup(await request.json());
    if (!input) {
      return badRequest("Invalid signup payload");
    }

    const existing = await getUserByEmail(input.email);
    if (existing) return badRequest("Email already registered");

    const user = await createUser({
      full_name: input.full_name,
      email: input.email,
      password_hash: hashPassword(input.password),
      role: AUTH_DEFAULT_ROLE,
    });

    return created({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    });
  } catch (err) {
    return serverError(String(err));
  }
}
