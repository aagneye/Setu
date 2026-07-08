"use client";

import { useEffect, useState } from "react";
import { HistoryTable } from "@/components/dashboard/HistoryTable";
import type { PipelineEvent } from "@/lib/pipeline/types";

export default function DashboardHistoryPage() {
  const [events, setEvents] = useState<PipelineEvent[]>([]);

  useEffect(() => {
    fetch("/api/dashboard/history?limit=200")
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []));
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Activity History</h1>
      <HistoryTable events={events} />
    </main>
  );
}
