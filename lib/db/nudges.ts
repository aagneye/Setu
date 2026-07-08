import { getSupabaseAdmin } from "@/lib/supabase";
import type { Nudge } from "@/lib/types";

export async function getNudgesForPO(poId: string): Promise<Nudge[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("nudges")
    .select("*")
    .eq("po_id", poId)
    .order("nudge_number", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Nudge[];
}

export async function insertNudge(
  poId: string,
  nudgeNumber: number
): Promise<Nudge> {
  const { data, error } = await getSupabaseAdmin()
    .from("nudges")
    .insert({ po_id: poId, nudge_number: nudgeNumber })
    .select()
    .single();

  if (error) throw error;
  return data as Nudge;
}

export async function escalateNudge(nudgeId: string): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("nudges")
    .update({ escalated_to_pm: true })
    .eq("id", nudgeId);

  if (error) throw error;
}

export async function getEscalatedPOIds(): Promise<string[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("nudges")
    .select("po_id")
    .eq("escalated_to_pm", true);

  if (error) throw error;
  return (data ?? []).map((n) => n.po_id);
}
