import { NextResponse } from "next/server";
import { getPOById, patchPOStatus } from "@/lib/db/purchase-orders";
import { insertPOUpdate } from "@/lib/db/po-updates";
import { validateUpdateStatus } from "@/lib/validators/po";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const po = await getPOById(params.id);
  if (!po) {
    return NextResponse.json({ error: "PO not found" }, { status: 404 });
  }

  const body = await request.json();
  const input = validateUpdateStatus(body);
  if (!input) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await patchPOStatus(
    params.id,
    input.status,
    input.current_eta
  );

  await insertPOUpdate({
    po_id: params.id,
    source: "manual",
    raw_message: `Manual status update to ${input.status}`,
    new_status: input.status,
    new_eta: input.current_eta ?? null,
  });

  return NextResponse.json(updated);
}
