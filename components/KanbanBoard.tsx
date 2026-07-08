"use client";

import { POCard } from "@/components/POCard";
import type { POStatus, PurchaseOrder } from "@/lib/types";
import { PO_STATUSES, STATUS_LABELS } from "@/lib/types";

interface KanbanBoardProps {
  pos: PurchaseOrder[];
  escalatedIds: Set<string>;
}

const COLUMN_COLORS: Record<POStatus, string> = {
  ordered: "bg-slate-50 border-slate-200",
  confirmed: "bg-blue-50 border-blue-200",
  in_transit: "bg-amber-50 border-amber-200",
  delayed: "bg-red-50 border-red-200",
  delivered: "bg-green-50 border-green-200",
};

export function KanbanBoard({ pos, escalatedIds }: KanbanBoardProps) {
  const grouped = PO_STATUSES.reduce(
    (acc, status) => {
      acc[status] = pos.filter((po) => po.status === status);
      return acc;
    },
    {} as Record<POStatus, PurchaseOrder[]>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {PO_STATUSES.map((status) => (
        <div
          key={status}
          className={`rounded-lg border p-3 min-h-[200px] ${COLUMN_COLORS[status]}`}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">{STATUS_LABELS[status]}</h3>
            <span className="text-xs text-muted-foreground bg-white rounded-full px-2 py-0.5">
              {grouped[status].length}
            </span>
          </div>
          <div className="space-y-2">
            {grouped[status].map((po) => (
              <POCard
                key={po.id}
                po={po}
                escalated={escalatedIds.has(po.id)}
              />
            ))}
            {grouped[status].length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                No items
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
