import { listVendors, createVendor } from "@/lib/db/vendors";
import { validateCreateVendor } from "@/lib/validators/vendor";
import { ok, created, badRequest } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";

export async function GET() {
  try {
    const vendors = await listVendors();
    return ok(vendors);
  } catch (err) {
    return handleApiError(err, "vendors");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = validateCreateVendor(body);
    if (!input) return badRequest("name and phone are required");

    const vendor = await createVendor({
      ...input,
      trade: input.trade ?? null,
      preferred_language: input.preferred_language ?? "hi",
    });
    return created(vendor);
  } catch (err) {
    return handleApiError(err, "vendors");
  }
}
