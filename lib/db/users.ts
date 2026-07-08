import { getSupabaseAdmin } from "@/lib/supabase";

export interface AppUser {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  role: string;
  created_at: string;
}

export async function createUser(input: {
  full_name: string;
  email: string;
  password_hash: string;
  role?: string;
}): Promise<AppUser> {
  const { data, error } = await getSupabaseAdmin()
    .from("app_users")
    .insert({ ...input, email: input.email.toLowerCase() })
    .select("*")
    .single();
  if (error) throw error;
  return data as AppUser;
}

export async function getUserByEmail(email: string): Promise<AppUser | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("app_users")
    .select("*")
    .eq("email", email.toLowerCase())
    .single();
  if (error || !data) return null;
  return data as AppUser;
}

export async function getUserById(id: string): Promise<AppUser | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("app_users")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return data as AppUser;
}
