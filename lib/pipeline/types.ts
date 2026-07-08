import type { PipelineEventType } from "@/lib/constants";

export interface PipelineEvent {
  id?: string;
  event_type: PipelineEventType;
  pipeline: string;
  po_id?: string | null;
  po_number?: string | null;
  vendor_phone?: string | null;
  payload?: Record<string, unknown> | null;
  error_message?: string | null;
  duration_ms?: number | null;
  created_at?: string;
}

export interface WebhookContext {
  from: string;
  body: string;
  numMedia: number;
  mediaUrl: string | null;
  mediaContentType: string | null;
  messageSid: string | null;
}

export interface PipelineResult {
  success: boolean;
  action: string;
  po_number?: string;
  reply?: string;
  error?: string;
}

export interface AgentAction {
  po_number: string;
  action: string;
  message?: string;
}

export interface AgentRunResult {
  checked: number;
  actions: AgentAction[];
}
