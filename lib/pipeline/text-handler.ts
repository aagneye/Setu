import { extractPOUpdate } from "@/lib/claude";
import { applyTextExtraction } from "@/lib/pipeline/apply-update";
import { matchPOFromMessage } from "@/lib/pipeline/match-po";
import { logPipelineEvent } from "@/lib/db/pipeline-events";
import { PIPELINE_EVENTS } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { ExtractionError } from "@/lib/errors";
import type { PurchaseOrder } from "@/lib/types";
import type { PipelineResult } from "@/lib/pipeline/types";
import {
  confidenceLabel,
  needsReview,
  shouldAutoApply,
} from "@/lib/pipeline/confidence";
import { createAlert } from "@/lib/db/alerts";
import { insertPOUpdate } from "@/lib/db/po-updates";

export async function handleTextMessage(
  openPOs: PurchaseOrder[],
  messageText: string,
  vendorPhone: string,
  mediaUrl?: string | null
): Promise<PipelineResult> {
  const start = Date.now();

  let extraction;
  try {
    extraction = await extractPOUpdate(messageText, openPOs);
  } catch (err) {
    throw new ExtractionError(String(err));
  }

  await logPipelineEvent({
    event_type: PIPELINE_EVENTS.TEXT_EXTRACTED,
    pipeline: "text",
    vendor_phone: vendorPhone,
    payload: extraction as unknown as Record<string, unknown>,
    duration_ms: Date.now() - start,
  });

  const matchedPO = matchPOFromMessage(
    openPOs,
    messageText,
    extraction.po_number
  );

  if (!matchedPO) {
    logger.warn("Could not match PO from message", {
      pipeline: "text",
      vendor_phone: vendorPhone,
    });
    return {
      success: false,
      action: "po_not_matched",
      reply:
        extraction.suggested_reply_to_vendor ||
        "Kaunsa PO? PO number bataiye jaise PO-1042.",
    };
  }

  if (!shouldAutoApply(extraction) || needsReview(extraction)) {
    await createAlert({
      po_id: matchedPO.id,
      alert_type: "low_confidence_update",
      severity: extraction.confidence === "low" ? "critical" : "warning",
      message: `${matchedPO.po_number} update requires review: ${confidenceLabel(extraction.confidence)}`,
    });

    await insertPOUpdate({
      po_id: matchedPO.id,
      source: "vendor_whatsapp",
      raw_message: messageText,
      extracted_json: extraction,
      media_url: mediaUrl,
    });

    return {
      success: false,
      action: "manual_review_required",
      po_number: matchedPO.po_number,
      reply:
        extraction.suggested_reply_to_vendor ||
        "Update mila, team verify karke confirm karegi.",
    };
  }

  return applyTextExtraction(
    matchedPO.id,
    matchedPO.po_number,
    matchedPO.status,
    messageText,
    extraction,
    mediaUrl
  );
}
