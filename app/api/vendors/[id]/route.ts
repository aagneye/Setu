import { NextResponse } from "next/server";
import { getVendorById } from "@/lib/db/vendors";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const vendor = await getVendorById(params.id);
  if (!vendor) {
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  }
  return NextResponse.json(vendor);
}
