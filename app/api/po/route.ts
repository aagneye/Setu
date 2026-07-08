import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
export async function GET() {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("purchase_orders")
    .select("*, vendors(*)")
    .order("due_date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("purchase_orders")
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
