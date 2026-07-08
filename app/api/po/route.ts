import { NextResponse } from "next/server";
import { listAllPOs, createPO } from "@/lib/db/purchase-orders";
import { validateCreatePO } from "@/lib/validators/po";

export async function GET() {
  try {
    const data = await listAllPOs();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = validateCreatePO(body);
    if (!input) {
      return NextResponse.json({ error: "Invalid PO data" }, { status: 400 });
    }

    const data = await createPO({
      ...input,
      status: input.status ?? "ordered",
      is_critical_path: input.is_critical_path ?? false,
      project_site: input.project_site ?? "Site A",
    });

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
