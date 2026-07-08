"use client";

import type { ProcurementStats } from "@/lib/db/stats";

interface StatsBarProps {
  stats: ProcurementStats | null;
  loading?: boolean;
}

export function StatsBar({ stats, loading }: StatsBarProps) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  const items = [
    { label: "Open POs", value: stats.open, color: "text-blue-600" },
    { label: "Delayed", value: stats.delayed, color: "text-orange-600" },
    { label: "Critical", value: stats.critical_path, color: "text-purple-600" },
    { label: "Critical Overdue", value: stats.critical_overdue, color: "text-destructive" },
    { label: "Escalated", value: stats.escalated, color: "text-destructive" },
    { label: "Updates (24h)", value: stats.updates_last_24h, color: "text-green-600" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border bg-card p-3 text-center"
        >
          <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
