import type { POStatus } from "@/lib/types";

const ALLOWED: Record<POStatus, POStatus[]> = {
  ordered: ["confirmed", "delayed", "in_transit", "delivered"],
  confirmed: ["in_transit", "delayed", "delivered"],
  in_transit: ["delivered", "delayed"],
  delayed: ["in_transit", "delivered", "confirmed"],
  delivered: [],
};

export function canTransition(from: POStatus, to: POStatus): boolean {
  if (from === to) return true;
  return ALLOWED[from]?.includes(to) ?? false;
}

export function coerceStatus(
  current: POStatus,
  proposed: string | null | undefined
): POStatus | null {
  if (!proposed || proposed === "unclear") return null;
  const to = proposed as POStatus;
  if (!ALLOWED[current] && to !== current) return null;
  return canTransition(current, to) ? to : null;
}
