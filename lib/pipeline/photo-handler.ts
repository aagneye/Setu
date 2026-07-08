import { verifyDeliveryPhoto } from "@/lib/claude";
import { insertGRN } from "@/lib/db/grns";
import { updatePO } from "@/lib/db/purchase-orders";
import { insertPOUpdate } from "@/lib/db/po-updates";
import { matchPOFromPhoto } from "@/lib/pipeline/match-po";
import { logPipelineEvent } from "@/lib/db/pipeline-events";
import { PIPELINE_EVENTS } from "@/lib/constants";
import { logger } from "@/lib/logger";
import type { PurchaseOrder } from "@/lib/types";
import type { PipelineResult } from "@/lib/pipeline/types";

function resolveImageType(
  contentType: string | null
): "image/jpeg" | "image/png" | "image/webp" {
  if (contentType?.includes("png")) return "image/png";
  if (contentType?.includes("webp")) return "image/webp";
  return "image/jpeg";
}

export async function handlePhotoMessage(
  openPOs: PurchaseOrder[],
  imageBuffer: ArrayBuffer,
  mediaContentType: string | null,
  mediaUrl: string,
  body: string,
  vendorPhone: string
): Promise<PipelineResult> {
  const start = Date.now();
  const targetPO = matchPOFromPhoto(openPOs, body);

  if (!targetPO) {
    return {
      success: false,
      action: "no_open_po",
      reply: "Photo mila, lekin koi open PO nahi mila. PO number bataiye.",
    };
  }

  const base64 = Buffer.from(imageBuffer).toString("base64");
  const mediaType = resolveImageType(mediaContentType);
  const vision = await verifyDeliveryPhoto(base64, mediaType, targetPO);

  await insertGRN({
    po_id: targetPO.id,
    photo_url: mediaUrl,
    verified_quantity: vision.estimated_quantity_visible
      ? parseFloat(vision.estimated_quantity_visible)
      : null,
    verified_item_match: vision.item_match,
    mismatch_notes: vision.mismatch_notes,
    vision_raw_response: vision,
  });

  const delivered = vision.grn_recommendation === "approve";
  if (delivered) {
    await updatePO(targetPO.id, { status: "delivered" });
  }

  await insertPOUpdate({
    po_id: targetPO.id,
    source: "vendor_whatsapp",
    raw_message: body || "[Photo delivery]",
    media_url: mediaUrl,
    extracted_json: vision,
    new_status: delivered ? "delivered" : null,
  });

  await logPipelineEvent({
    event_type: PIPELINE_EVENTS.PHOTO_VERIFIED,
    pipeline: "photo",
    po_id: targetPO.id,
    po_number: targetPO.po_number,
    vendor_phone: vendorPhone,
    payload: vision as unknown as Record<string, unknown>,
    duration_ms: Date.now() - start,
  });

  logger.info("Photo verified", {
    pipeline: "photo",
    po_number: targetPO.po_number,
    event: PIPELINE_EVENTS.PHOTO_VERIFIED,
  });

  const reply = delivered
    ? `✅ ${targetPO.po_number} delivery verified. GRN approved. Dhanyavaad!`
    : `📋 ${targetPO.po_number} photo received — flagged for review. Team will check.`;

  return {
    success: true,
    action: delivered ? "grn_approved" : "grn_flagged",
    po_number: targetPO.po_number,
    reply,
  };
}
