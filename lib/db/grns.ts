import { getSupabaseAdmin } from "@/lib/supabase";
import type { GRN, VisionResult } from "@/lib/types";

export interface InsertGRNInput {
  po_id: string;
  photo_url: string;
  verified_quantity?: number | null;
  verified_item_match?: boolean | null;
  mismatch_notes?: string | null;
  vision_raw_response?: VisionResult | null;
}

export async function insertGRN(input: InsertGRNInput): Promise<GRN> {
  const { data, error } = await getSupabaseAdmin()
    .from("grns")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as GRN;
}

export async function getGRNsForPO(poId: string): Promise<GRN[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("grns")
    .select("*")
    .eq("po_id", poId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as GRN[];
}
