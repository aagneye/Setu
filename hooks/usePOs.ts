"use client";

import { useCallback, useEffect, useState } from "react";
import type { PurchaseOrder } from "@/lib/types";

export function usePOs() {
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPOs = useCallback(async () => {
    try {
      const res = await fetch("/api/po");
      if (!res.ok) throw new Error("Failed to fetch POs");
      const data = await res.json();
      setPos(data);
      setError(null);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPOs();
  }, [fetchPOs]);

  return { pos, loading, error, refresh: fetchPOs };
}
