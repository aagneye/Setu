import { generateNudgeMessage } from "@/lib/claude";
import { insertNudge } from "@/lib/db/nudges";
import { insertPOUpdate } from "@/lib/db/po-updates";
import { sendWhatsAppMessage } from "@/lib/twilio";
import { logPipelineEvent } from "@/lib/db/pipeline-events";
import { PIPELINE_EVENTS } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { daysOverdue } from "@/lib/utils";
import type { PurchaseOrder, Vendor } from "@/lib/types";
import type { AgentAction } from "@/lib/pipeline/types";

export async function sendNudge(
  po: PurchaseOrder,
  vendor: Vendor,
  nudgeNumber: number
): Promise<AgentAction> {
  const overdue = daysOverdue(po.due_date);
  const message = await generateNudgeMessage(
    po.po_number,
    po.item_description,
    po.due_date,
    overdue,
    nudgeNumber
  );

  await sendWhatsAppMessage(vendor.phone, message);
  await insertNudge(po.id, nudgeNumber);
  await insertPOUpdate({
    po_id: po.id,
    source: "agent_nudge",
    raw_message: message,
  });

  await logPipelineEvent({
    event_type: PIPELINE_EVENTS.NUDGE_SENT,
    pipeline: "agent",
    po_id: po.id,
    po_number: po.po_number,
    vendor_phone: vendor.phone,
    payload: { nudge_number: nudgeNumber, message },
  });

  logger.info("Nudge sent", {
    pipeline: "agent",
    po_number: po.po_number,
    event: PIPELINE_EVENTS.NUDGE_SENT,
  });

  return {
    po_number: po.po_number,
    action: `nudge_${nudgeNumber}`,
    message,
  };
}
