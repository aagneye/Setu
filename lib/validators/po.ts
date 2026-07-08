import type { POStatus } from "@/lib/types";
import { PO_STATUSES } from "@/lib/types";

export interface CreatePOInput {
  po_number: string;
  vendor_id: string;
  item_description: string;
  quantity?: number;
  unit?: string;
  due_date: string;
  status?: POStatus;
  is_critical_path?: boolean;
  project_site?: string;
}

export interface UpdatePOStatusInput {
  status: POStatus;
  current_eta?: string;
}

export function validatePOStatus(status: string): POStatus | null {
  if (PO_STATUSES.includes(status as POStatus)) return status as POStatus;
  return null;
}

export function validateCreatePO(body: unknown): CreatePOInput | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (
    typeof b.po_number !== "string" ||
    typeof b.vendor_id !== "string" ||
    typeof b.item_description !== "string" ||
    typeof b.due_date !== "string"
  ) {
    return null;
  }
  return {
    po_number: b.po_number,
    vendor_id: b.vendor_id,
    item_description: b.item_description,
    quantity: typeof b.quantity === "number" ? b.quantity : undefined,
    unit: typeof b.unit === "string" ? b.unit : undefined,
    due_date: b.due_date,
    status: validatePOStatus(b.status as string) ?? undefined,
    is_critical_path:
      typeof b.is_critical_path === "boolean" ? b.is_critical_path : undefined,
    project_site:
      typeof b.project_site === "string" ? b.project_site : undefined,
  };
}

export function validateUpdateStatus(body: unknown): UpdatePOStatusInput | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const status = validatePOStatus(b.status as string);
  if (!status) return null;
  return {
    status,
    current_eta:
      typeof b.current_eta === "string" ? b.current_eta : undefined,
  };
}
