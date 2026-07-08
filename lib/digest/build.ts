import { listAllPOs } from "@/lib/db/purchase-orders";
import { isOverdue } from "@/lib/utils";
import type { PurchaseOrder } from "@/lib/types";

export interface DigestSummary {
  generated_at: string;
  total_open: number;
  delayed_count: number;
  critical_delayed: string[];
  escalated: string[];
  by_status: Record<string, number>;
  message: string;
}

export async function buildDailyDigest(): Promise<DigestSummary> {
  const pos = await listAllPOs();
  const open = pos.filter((p) => p.status !== "delivered");

  const delayed = open.filter(
    (p) =>
      p.status === "delayed" ||
      isOverdue(p.due_date, p.current_eta)
  );

  const criticalDelayed = delayed
    .filter((p) => p.is_critical_path)
    .map((p) => `${p.po_number} (${p.item_description})`);

  const byStatus: Record<string, number> = {};
  for (const p of open) {
    byStatus[p.status] = (byStatus[p.status] ?? 0) + 1;
  }

  const parts: string[] = [];
  if (delayed.length > 0) {
    parts.push(
      `${delayed.length} item${delayed.length > 1 ? "s" : ""} delayed`
    );
  }
  if (criticalDelayed.length > 0) {
    parts.push(
      `${criticalDelayed.length} critical path risk${criticalDelayed.length > 1 ? "s" : ""}: ${criticalDelayed.join(", ")}`
    );
  }
  if (parts.length === 0) {
    parts.push("All open POs on track");
  }

  return {
    generated_at: new Date().toISOString(),
    total_open: open.length,
    delayed_count: delayed.length,
    critical_delayed: criticalDelayed,
    escalated: [],
    by_status: byStatus,
    message: parts.join(" — "),
  };
}

export function formatDigestMessage(digest: DigestSummary): string {
  return `📋 Setu Daily Digest\n${digest.message}\n\nOpen POs: ${digest.total_open}`;
}
