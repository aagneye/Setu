"use client";

import { useCallback, useEffect, useState } from "react";
import type { ProcurementStats } from "@/lib/db/stats";
import type { PipelineEvent } from "@/lib/pipeline/types";
import type { Alert } from "@/lib/db/alerts";

interface OverviewData {
  stats: ProcurementStats | null;
  events: PipelineEvent[];
  alerts: Alert[];
}

export function useDashboardOverview() {
  const [data, setData] = useState<OverviewData>({
    stats: null,
    events: [],
    alerts: [],
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/dashboard/overview");
    if (res.ok) {
      const json = await res.json();
      setData(json);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...data, loading, refresh };
}
