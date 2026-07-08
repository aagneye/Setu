import { NextResponse } from "next/server";
import { getPOById } from "@/lib/db/purchase-orders";
import { getUpdatesForPO } from "@/lib/db/po-updates";
import { getGRNsForPO } from "@/lib/db/grns";
import { getNudgesForPO } from "@/lib/db/nudges";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const po = await getPOById(params.id);

  if (!po) {
    return NextResponse.json({ error: "PO not found" }, { status: 404 });
  }

  const [po_updates, grns, nudges] = await Promise.all([
    getUpdatesForPO(params.id),
    getGRNsForPO(params.id),
    getNudgesForPO(params.id),
  ]);

  return NextResponse.json({ ...po, po_updates, grns, nudges });
}
