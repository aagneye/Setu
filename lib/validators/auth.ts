export interface SignupInput {
  full_name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateSignup(body: unknown): SignupInput | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (
    typeof b.full_name !== "string" ||
    typeof b.email !== "string" ||
    typeof b.password !== "string"
  ) {
    return null;
  }
  const email = b.email.trim().toLowerCase();
  if (!isEmail(email) || b.password.length < 8) return null;
  return {
    full_name: b.full_name.trim(),
    email,
    password: b.password,
  };
}

export function validateLogin(body: unknown): LoginInput | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (typeof b.email !== "string" || typeof b.password !== "string") return null;
  const email = b.email.trim().toLowerCase();
  if (!isEmail(email) || !b.password) return null;
  return { email, password: b.password };
}
