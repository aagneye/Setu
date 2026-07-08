import { NextResponse } from "next/server";
import { listVendors, createVendor } from "@/lib/db/vendors";

export async function GET() {
  try {
    const vendors = await listVendors();
    return NextResponse.json(vendors);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.phone) {
      return NextResponse.json(
        { error: "name and phone are required" },
        { status: 400 }
      );
    }

    const phone = body.phone.startsWith("whatsapp:")
      ? body.phone
      : `whatsapp:${body.phone}`;

    const vendor = await createVendor({
      name: body.name,
      phone,
      trade: body.trade ?? null,
      preferred_language: body.preferred_language ?? "hi",
    });

    return NextResponse.json(vendor, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
