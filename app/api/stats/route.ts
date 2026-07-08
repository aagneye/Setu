import { getProcurementStats } from "@/lib/db/stats";
import { ok } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";

export async function GET() {
  try {
    const stats = await getProcurementStats();
    return ok(stats);
  } catch (err) {
    return handleApiError(err, "stats");
  }
}
