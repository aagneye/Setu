import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseAdmin();

  const { data: po, error: poError } = await supabase
    .from("purchase_orders")
    .select("*, vendors(*)")
    .eq("id", params.id)
    .single();

  if (poError) {
    return NextResponse.json({ error: poError.message }, { status: 404 });
  }

  const [updates, grns, nudges] = await Promise.all([
    supabase
      .from("po_updates")
      .select("*")
      .eq("po_id", params.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("grns")
      .select("*")
      .eq("po_id", params.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("nudges")
      .select("*")
      .eq("po_id", params.id)
      .order("sent_at", { ascending: false }),
  ]);

  return NextResponse.json({
    ...po,
    po_updates: updates.data ?? [],
    grns: grns.data ?? [],
    nudges: nudges.data ?? [],
  });
}
