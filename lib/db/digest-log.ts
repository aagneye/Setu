import { getSupabaseAdmin } from "@/lib/supabase";
import type { DigestSummary } from "@/lib/digest/build";

export async function logDigest(
  summary: DigestSummary,
  message: string
): Promise<void> {
  await getSupabaseAdmin()
    .from("digest_log")
    .insert({ summary, message });
}

export async function getRecentDigests(limit = 10) {
  const { data, error } = await getSupabaseAdmin()
    .from("digest_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return data ?? [];
}
