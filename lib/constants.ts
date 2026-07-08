/** Agent nudge: hours without vendor update before nudging */
export const STALE_HOURS = 24;

/** Agent nudge: only POs due within this many days */
export const NUDGE_WINDOW_DAYS = 7;

/** Max nudges before escalation to PM */
export const MAX_NUDGES = 2;

/** Claude model for extraction, vision, and nudge generation */
export const CLAUDE_MODEL = "claude-sonnet-4-20250514";

/** Deepgram model for Hindi/Hinglish voice notes */
export const DEEPGRAM_MODEL = "nova-2";

/** Pipeline event types for audit log */
export const PIPELINE_EVENTS = {
  WEBHOOK_RECEIVED: "webhook_received",
  VOICE_TRANSCRIBED: "voice_transcribed",
  TEXT_EXTRACTED: "text_extracted",
  PHOTO_VERIFIED: "photo_verified",
  PO_UPDATED: "po_updated",
  NUDGE_SENT: "nudge_sent",
  ESCALATED: "escalated",
  VENDOR_NOT_FOUND: "vendor_not_found",
  ERROR: "error",
} as const;

export type PipelineEventType =
  (typeof PIPELINE_EVENTS)[keyof typeof PIPELINE_EVENTS];
