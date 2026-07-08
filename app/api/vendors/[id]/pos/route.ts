import { getOpenPOsForVendor } from "@/lib/db/purchase-orders";
import { getVendorById } from "@/lib/db/vendors";
import { ok, notFound } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const vendor = await getVendorById(params.id);
    if (!vendor) return notFound("Vendor not found");

    const pos = await getOpenPOsForVendor(params.id);
    return ok({ vendor, purchase_orders: pos });
  } catch (err) {
    return handleApiError(err, "vendor-pos");
  }
}
