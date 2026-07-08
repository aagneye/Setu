import type { PurchaseOrder } from "@/lib/types";

export function matchPOFromMessage(
  openPOs: PurchaseOrder[],
  messageText: string,
  extractedPONumber?: string | null
): PurchaseOrder | null {
  if (extractedPONumber) {
    const exact = openPOs.find((po) => po.po_number === extractedPONumber);
    if (exact) return exact;
  }

  const lower = messageText.toLowerCase();
  for (const po of openPOs) {
    if (lower.includes(po.po_number.toLowerCase())) return po;
  }

  return null;
}

export function matchPOFromPhoto(
  openPOs: PurchaseOrder[],
  body: string
): PurchaseOrder | null {
  if (body.trim()) {
    const fromBody = matchPOFromMessage(openPOs, body);
    if (fromBody) return fromBody;
  }

  return openPOs.length === 1 ? openPOs[0] : openPOs[0] ?? null;
}
