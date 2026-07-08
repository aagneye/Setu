import { updatePO } from "@/lib/db/purchase-orders";
import { insertPOUpdate, markNudgesResponded } from "@/lib/db/po-updates";
import { validatePOStatus } from "@/lib/validators/po";
import { logger } from "@/lib/logger";
import { PIPELINE_EVENTS } from "@/lib/constants";
import { logPipelineEvent } from "@/lib/db/pipeline-events";
import type { ExtractionResult, POStatus } from "@/lib/types";
import type { PipelineResult } from "@/lib/pipeline/types";
import { coerceStatus } from "@/lib/pipeline/status-transitions";
import { createAlert } from "@/lib/db/alerts";

export async function applyTextExtraction(
  poId: string,
  poNumber: string,
  currentStatus: POStatus,
  messageText: string,
  extraction: ExtractionResult,
  mediaUrl?: string | null
): Promise<PipelineResult> {
  const proposedStatus = validatePOStatus(extraction.new_status);
  const newStatus = coerceStatus(currentStatus, proposedStatus);
  if (proposedStatus && !newStatus) {
    await createAlert({
      po_id: poId,
      alert_type: "invalid_transition",
      severity: "warning",
      message: `${poNumber} requested invalid status transition ${currentStatus} -> ${proposedStatus}`,
    });
  }
  const poUpdates: { status?: POStatus; current_eta?: string } = {};
  if (newStatus) poUpdates.status = newStatus;
  if (extraction.new_eta) poUpdates.current_eta = extraction.new_eta;

  if (Object.keys(poUpdates).length > 0) {
    await updatePO(poId, poUpdates);
  }

  await insertPOUpdate({
    po_id: poId,
    source: "vendor_whatsapp",
    raw_message: messageText,
    extracted_json: extraction,
    new_status: newStatus,
    new_eta: extraction.new_eta,
    delay_reason: extraction.delay_reason,
    media_url: mediaUrl,
  });

  await markNudgesResponded(poId);

  await logPipelineEvent({
    event_type: PIPELINE_EVENTS.PO_UPDATED,
    pipeline: "text",
    po_id: poId,
    po_number: poNumber,
    payload: { new_status: newStatus, new_eta: extraction.new_eta },
  });

  logger.info("PO updated from text extraction", {
    pipeline: "text",
    po_number: poNumber,
    event: PIPELINE_EVENTS.PO_UPDATED,
  });

  return {
    success: true,
    action: "po_updated",
    po_number: poNumber,
    reply: extraction.suggested_reply_to_vendor,
  };
}
