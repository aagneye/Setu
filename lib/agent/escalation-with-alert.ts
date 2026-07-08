import { createEscalationAlert } from "@/lib/db/alerts";
import { escalateNudge } from "@/lib/db/nudges";
import { logPipelineEvent } from "@/lib/db/pipeline-events";
import { PIPELINE_EVENTS } from "@/lib/constants";
import { logger } from "@/lib/logger";
import type { StalePO } from "@/lib/agent/stale-pos";
import type { AgentAction } from "@/lib/pipeline/types";

export async function escalatePOWithAlert(stale: StalePO): Promise<AgentAction> {
  if (!stale.latestNudgeId) {
    return { po_number: stale.po.po_number, action: "escalation_skipped" };
  }

  await escalateNudge(stale.latestNudgeId);
  await createEscalationAlert(stale.po.id, stale.po.po_number);

  await logPipelineEvent({
    event_type: PIPELINE_EVENTS.ESCALATED,
    pipeline: "agent",
    po_id: stale.po.id,
    po_number: stale.po.po_number,
    payload: { nudge_count: stale.nudgeCount },
  });

  logger.warn("PO escalated with dashboard alert", {
    pipeline: "agent",
    po_number: stale.po.po_number,
  });

  return { po_number: stale.po.po_number, action: "escalated" };
}
