import { getSupabaseAdmin } from "@/lib/supabase";
import type { POStatus, PurchaseOrder } from "@/lib/types";
import { NUDGE_WINDOW_DAYS } from "@/lib/constants";

export async function getOpenPOsForVendor(
  vendorId: string
): Promise<PurchaseOrder[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("purchase_orders")
    .select("*")
    .eq("vendor_id", vendorId)
    .neq("status", "delivered");

  if (error) throw error;
  return (data ?? []) as PurchaseOrder[];
}

export async function getPOById(id: string): Promise<PurchaseOrder | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("purchase_orders")
    .select("*, vendors(*)")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as PurchaseOrder;
}

export async function getPOByNumber(
  poNumber: string
): Promise<PurchaseOrder | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("purchase_orders")
    .select("*")
    .eq("po_number", poNumber)
    .single();

  if (error || !data) return null;
  return data as PurchaseOrder;
}

export async function listAllPOs(): Promise<PurchaseOrder[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("purchase_orders")
    .select("*, vendors(*)")
    .order("due_date", { ascending: true });

  if (error) throw error;
  return (data ?? []) as PurchaseOrder[];
}

export async function updatePO(
  id: string,
  updates: Partial<Pick<PurchaseOrder, "status" | "current_eta">> & {
    updated_at?: string;
  }
): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("purchase_orders")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export async function getNudgeCandidatePOs(): Promise<PurchaseOrder[]> {
  const windowCutoff = new Date(
    Date.now() + NUDGE_WINDOW_DAYS * 24 * 60 * 60 * 1000
  )
    .toISOString()
    .split("T")[0];

  const { data, error } = await getSupabaseAdmin()
    .from("purchase_orders")
    .select("*, vendors(*)")
    .neq("status", "delivered")
    .lte("due_date", windowCutoff);

  if (error) throw error;
  return (data ?? []) as PurchaseOrder[];
}

export async function createPO(
  input: Record<string, unknown>
): Promise<PurchaseOrder> {
  const { data, error } = await getSupabaseAdmin()
    .from("purchase_orders")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as PurchaseOrder;
}

export async function patchPOStatus(
  id: string,
  status: POStatus,
  currentEta?: string
): Promise<PurchaseOrder> {
  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (currentEta) updates.current_eta = currentEta;

  const { data, error } = await getSupabaseAdmin()
    .from("purchase_orders")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as PurchaseOrder;
}
