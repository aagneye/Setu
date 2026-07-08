import { getSupabaseAdmin } from "@/lib/supabase";
import type { PipelineEvent } from "@/lib/pipeline/types";

export async function logPipelineEvent(
  event: Omit<PipelineEvent, "id" | "created_at">
): Promise<void> {
  try {
    await getSupabaseAdmin().from("pipeline_events").insert(event);
  } catch {
    // audit log failure should not break the pipeline
  }
}

export async function getRecentPipelineEvents(
  limit = 50
): Promise<PipelineEvent[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("pipeline_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []) as PipelineEvent[];
}

export async function getEventsForPO(poId: string): Promise<PipelineEvent[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("pipeline_events")
    .select("*")
    .eq("po_id", poId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as PipelineEvent[];
}
