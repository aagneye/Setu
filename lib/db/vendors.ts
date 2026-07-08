import { getSupabaseAdmin } from "@/lib/supabase";
import type { Vendor } from "@/lib/types";

export async function findVendorByPhone(
  phone: string
): Promise<Vendor | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("vendors")
    .select("*")
    .eq("phone", phone)
    .single();

  if (error || !data) return null;
  return data as Vendor;
}

export async function listVendors(): Promise<Vendor[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("vendors")
    .select("*")
    .order("name");

  if (error) throw error;
  return (data ?? []) as Vendor[];
}

export async function createVendor(
  input: Omit<Vendor, "id" | "created_at">
): Promise<Vendor> {
  const { data, error } = await getSupabaseAdmin()
    .from("vendors")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as Vendor;
}

export async function getVendorById(id: string): Promise<Vendor | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("vendors")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as Vendor;
}
