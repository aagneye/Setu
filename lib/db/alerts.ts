import { getSupabaseAdmin } from "@/lib/supabase";

export interface Alert {
  id: string;
  po_id: string | null;
  alert_type: string;
  severity: "info" | "warning" | "critical";
  message: string;
  acknowledged: boolean;
  created_at: string;
}

export async function createAlert(
  input: Omit<Alert, "id" | "acknowledged" | "created_at">
): Promise<Alert> {
  const { data, error } = await getSupabaseAdmin()
    .from("alerts")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as Alert;
}

export async function listActiveAlerts(): Promise<Alert[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("alerts")
    .select("*")
    .eq("acknowledged", false)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Alert[];
}

export async function acknowledgeAlert(id: string): Promise<Alert> {
  const { data, error } = await getSupabaseAdmin()
    .from("alerts")
    .update({ acknowledged: true })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Alert;
}

export async function createEscalationAlert(
  poId: string,
  poNumber: string
): Promise<Alert> {
  return createAlert({
    po_id: poId,
    alert_type: "escalation",
    severity: "critical",
    message: `${poNumber} escalated — vendor unresponsive after 2 nudges`,
  });
}
