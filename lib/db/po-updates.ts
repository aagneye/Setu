import { getSupabaseAdmin } from "@/lib/supabase";
import type { POUpdate, UpdateSource } from "@/lib/types";
import { STALE_HOURS } from "@/lib/constants";

export interface InsertPOUpdateInput {
  po_id: string;
  source: UpdateSource;
  raw_message?: string | null;
  original_language?: string | null;
  extracted_json?: unknown;
  new_status?: string | null;
  new_eta?: string | null;
  delay_reason?: string | null;
  media_url?: string | null;
}

export async function insertPOUpdate(
  input: InsertPOUpdateInput
): Promise<POUpdate> {
  const { data, error } = await getSupabaseAdmin()
    .from("po_updates")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as POUpdate;
}

export async function getUpdatesForPO(poId: string): Promise<POUpdate[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("po_updates")
    .select("*")
    .eq("po_id", poId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as POUpdate[];
}

export async function hasRecentUpdate(poId: string): Promise<boolean> {
  const staleCutoff = new Date(
    Date.now() - STALE_HOURS * 60 * 60 * 1000
  ).toISOString();

  const { data, error } = await getSupabaseAdmin()
    .from("po_updates")
    .select("id")
    .eq("po_id", poId)
    .gte("created_at", staleCutoff)
    .limit(1);

  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

export async function markNudgesResponded(poId: string): Promise<void> {
  await getSupabaseAdmin()
    .from("nudges")
    .update({ responded: true })
    .eq("po_id", poId)
    .eq("responded", false);
}
