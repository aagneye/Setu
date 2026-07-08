export function unknownVendorReply(): string {
  return "Namaste! Aap registered vendor nahi hain. Site team se contact karein.";
}

export function emptyMessageReply(): string {
  return "Message samajh nahi aaya. Text ya voice note bhejein.";
}

export function pipelineErrorReply(): string {
  return "Kuch technical dikkat aayi. Thodi der baad phir try karein.";
}

export function poNotMatchedReply(): string {
  return "Kaunsa PO? PO number bataiye jaise PO-1042.";
}

export function nudgeAckReply(poNumber: string): string {
  return `Dhanyavaad ${poNumber} ke update ke liye!`;
}
