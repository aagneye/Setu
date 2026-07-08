import { NextResponse } from "next/server";
import { getPOById } from "@/lib/db/purchase-orders";
import { getUpdatesForPO, insertPOUpdate } from "@/lib/db/po-updates";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const po = await getPOById(params.id);
  if (!po) {
    return NextResponse.json({ error: "PO not found" }, { status: 404 });
  }

  const updates = await getUpdatesForPO(params.id);
  return NextResponse.json(updates);
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const po = await getPOById(params.id);
  if (!po) {
    return NextResponse.json({ error: "PO not found" }, { status: 404 });
  }

  const body = await request.json();
  if (!body.raw_message) {
    return NextResponse.json(
      { error: "raw_message is required" },
      { status: 400 }
    );
  }

  const update = await insertPOUpdate({
    po_id: params.id,
    source: "manual",
    raw_message: body.raw_message,
    new_status: body.new_status ?? null,
    new_eta: body.new_eta ?? null,
    delay_reason: body.delay_reason ?? null,
  });

  return NextResponse.json(update, { status: 201 });
}
