export type POStatus =
  | "ordered"
  | "confirmed"
  | "in_transit"
  | "delayed"
  | "delivered";

export type UpdateSource = "vendor_whatsapp" | "agent_nudge" | "manual";

export interface Vendor {
  id: string;
  name: string;
  phone: string;
  trade: string | null;
  preferred_language: string;
  created_at: string;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  vendor_id: string | null;
  item_description: string;
  quantity: number | null;
  unit: string | null;
  due_date: string;
  status: POStatus;
  is_critical_path: boolean;
  current_eta: string | null;
  project_site: string;
  created_at: string;
  updated_at: string;
  vendors?: Vendor;
}

export interface POUpdate {
  id: string;
  po_id: string;
  source: UpdateSource;
  raw_message: string | null;
  original_language: string | null;
  extracted_json: ExtractionResult | null;
  new_status: string | null;
  new_eta: string | null;
  delay_reason: string | null;
  media_url: string | null;
  created_at: string;
}

export interface GRN {
  id: string;
  po_id: string;
  photo_url: string;
  verified_quantity: number | null;
  verified_item_match: boolean | null;
  mismatch_notes: string | null;
  vision_raw_response: VisionResult | null;
  created_at: string;
}

export interface Nudge {
  id: string;
  po_id: string;
  nudge_number: number;
  sent_at: string;
  responded: boolean;
  escalated_to_pm: boolean;
}

export interface ExtractionResult {
  po_number: string | null;
  new_status: POStatus | "unclear";
  new_eta: string | null;
  delay_reason: string | null;
  confidence: "high" | "medium" | "low";
  suggested_reply_to_vendor: string;
}

export interface VisionResult {
  item_visible: string;
  item_match: boolean;
  estimated_quantity_visible: string | null;
  quantity_match_confidence: "high" | "medium" | "low" | "cannot_determine";
  mismatch_notes: string | null;
  grn_recommendation: "approve" | "flag_for_review";
}

export interface POWithDetails extends PurchaseOrder {
  po_updates: POUpdate[];
  grns: GRN[];
  nudges: Nudge[];
}

export const PO_STATUSES: POStatus[] = [
  "ordered",
  "confirmed",
  "in_transit",
  "delayed",
  "delivered",
];

export const STATUS_LABELS: Record<POStatus, string> = {
  ordered: "Ordered",
  confirmed: "Confirmed",
  in_transit: "In Transit",
  delayed: "Delayed",
  delivered: "Delivered",
};
