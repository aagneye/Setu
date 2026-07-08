"use client";

import { useCallback, useEffect, useState } from "react";
import type { Alert } from "@/lib/db/alerts";

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch("/api/alerts");
      if (res.ok) setAlerts(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  const acknowledge = useCallback(
    async (id: string) => {
      await fetch(`/api/alerts/${id}/ack`, { method: "POST" });
      await fetchAlerts();
    },
    [fetchAlerts]
  );

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return { alerts, loading, refresh: fetchAlerts, acknowledge };
}
