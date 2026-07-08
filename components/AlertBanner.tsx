"use client";

import { AlertTriangle } from "lucide-react";
import type { PurchaseOrder } from "@/lib/types";
import { isOverdue } from "@/lib/utils";

interface AlertBannerProps {
  pos: PurchaseOrder[];
  escalatedPOs: string[];
}

export function AlertBanner({ pos, escalatedPOs }: AlertBannerProps) {
  const criticalDelayed = pos.filter(
    (po) =>
      po.is_critical_path &&
      po.status !== "delivered" &&
      isOverdue(po.due_date, po.current_eta)
  );

  const delayedCount = pos.filter(
    (po) => po.status === "delayed" || (po.status !== "delivered" && isOverdue(po.due_date, po.current_eta))
  ).length;

  if (criticalDelayed.length === 0 && escalatedPOs.length === 0 && delayedCount === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="font-semibold text-destructive">Procurement Alerts</p>
          {delayedCount > 0 && (
            <p className="text-sm">
              {delayedCount} item{delayedCount > 1 ? "s" : ""} delayed
              {criticalDelayed.length > 0 &&
                ` — ${criticalDelayed.length} on critical path`}
            </p>
          )}
          {escalatedPOs.length > 0 && (
            <p className="text-sm font-medium">
              Escalated (no vendor response): {escalatedPOs.join(", ")}
            </p>
          )}
          {criticalDelayed.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Critical path risk:{" "}
              {criticalDelayed.map((po) => po.po_number).join(", ")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
