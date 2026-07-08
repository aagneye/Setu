import { getNudgeCandidatePOs } from "@/lib/db/purchase-orders";
import { hasRecentUpdate } from "@/lib/db/po-updates";
import { getNudgesForPO } from "@/lib/db/nudges";
import { MAX_NUDGES } from "@/lib/constants";
import type { PurchaseOrder } from "@/lib/types";

export interface StalePO {
  po: PurchaseOrder;
  nudgeCount: number;
  latestNudgeId: string | null;
  latestNudgeResponded: boolean;
  latestNudgeEscalated: boolean;
}

export async function findStalePOs(): Promise<StalePO[]> {
  const candidates = await getNudgeCandidatePOs();
  const stale: StalePO[] = [];

  for (const po of candidates) {
    const recent = await hasRecentUpdate(po.id);
    if (recent) continue;

    const nudges = await getNudgesForPO(po.id);
    const nudgeCount = nudges.length;
    const latest = nudges[0] ?? null;

    stale.push({
      po,
      nudgeCount,
      latestNudgeId: latest?.id ?? null,
      latestNudgeResponded: latest?.responded ?? false,
      latestNudgeEscalated: latest?.escalated_to_pm ?? false,
    });
  }

  return stale;
}

export function shouldEscalate(stale: StalePO): boolean {
  return (
    stale.nudgeCount >= MAX_NUDGES &&
    !stale.latestNudgeResponded &&
    !stale.latestNudgeEscalated
  );
}

export function shouldSendNudge(stale: StalePO): boolean {
  return stale.nudgeCount < MAX_NUDGES;
}
