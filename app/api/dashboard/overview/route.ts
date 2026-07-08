import { ok, serverError } from "@/lib/api/response";
import { getProcurementStats } from "@/lib/db/stats";
import { getRecentPipelineEvents } from "@/lib/db/pipeline-events";
import { listActiveAlerts } from "@/lib/db/alerts";

export async function GET() {
  try {
    const [stats, events, alerts] = await Promise.all([
      getProcurementStats(),
      getRecentPipelineEvents(12),
      listActiveAlerts(),
    ]);
    return ok({ stats, events, alerts });
  } catch (err) {
    return serverError(String(err));
  }
}
