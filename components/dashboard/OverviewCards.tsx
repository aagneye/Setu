import type { ProcurementStats } from "@/lib/db/stats";

export function OverviewCards({ stats }: { stats: ProcurementStats | null }) {
  if (!stats) return null;
  const cards = [
    { label: "Open POs", value: stats.open },
    { label: "Delayed", value: stats.delayed },
    { label: "Critical Overdue", value: stats.critical_overdue },
    { label: "Escalated", value: stats.escalated },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {cards.map((c) => (
        <div key={c.label} className="rounded-lg border bg-white p-4">
          <p className="text-xs text-muted-foreground">{c.label}</p>
          <p className="text-2xl font-bold mt-1">{c.value}</p>
        </div>
      ))}
    </div>
  );
}
