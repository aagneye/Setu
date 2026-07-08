import { getProcurementStats } from "@/lib/db/stats";
import { getRecentPipelineEvents } from "@/lib/db/pipeline-events";
import { listActiveAlerts } from "@/lib/db/alerts";
import { ok } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";

export async function GET() {
  try {
    const [stats, events, alerts] = await Promise.all([
      getProcurementStats(),
      getRecentPipelineEvents(10),
      listActiveAlerts(),
    ]);

    return ok({
      stats,
      recent_pipeline_events: events,
      active_alerts: alerts,
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    return handleApiError(err, "stats-summary");
  }
}
