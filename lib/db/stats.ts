import { getSupabaseAdmin } from "@/lib/supabase";
import type { POStatus } from "@/lib/types";
import { isOverdue } from "@/lib/utils";

export interface ProcurementStats {
  total: number;
  open: number;
  delivered: number;
  delayed: number;
  critical_path: number;
  critical_overdue: number;
  escalated: number;
  by_status: Record<POStatus, number>;
  vendors_count: number;
  updates_last_24h: number;
}

export async function getProcurementStats(): Promise<ProcurementStats> {
  const supabase = getSupabaseAdmin();
  const cutoff24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [pos, vendors, updates, escalated] = await Promise.all([
    supabase.from("purchase_orders").select("*"),
    supabase.from("vendors").select("id", { count: "exact", head: true }),
    supabase
      .from("po_updates")
      .select("id", { count: "exact", head: true })
      .gte("created_at", cutoff24h),
    supabase
      .from("nudges")
      .select("id", { count: "exact", head: true })
      .eq("escalated_to_pm", true),
  ]);

  const all = pos.data ?? [];
  const by_status = {
    ordered: 0,
    confirmed: 0,
    in_transit: 0,
    delayed: 0,
    delivered: 0,
  } as Record<POStatus, number>;

  let critical_overdue = 0;
  let delayed = 0;

  for (const p of all) {
    by_status[p.status as POStatus]++;
    const overdue =
      p.status !== "delivered" && isOverdue(p.due_date, p.current_eta);
    if (p.status === "delayed" || overdue) delayed++;
    if (p.is_critical_path && overdue) critical_overdue++;
  }

  const open = all.filter((p) => p.status !== "delivered").length;

  return {
    total: all.length,
    open,
    delivered: by_status.delivered,
    delayed,
    critical_path: all.filter((p) => p.is_critical_path).length,
    critical_overdue,
    escalated: escalated.count ?? 0,
    by_status,
    vendors_count: vendors.count ?? 0,
    updates_last_24h: updates.count ?? 0,
  };
}
