"use client";

import { useCallback, useState } from "react";

export function useAgent() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const triggerNudge = useCallback(async () => {
    setRunning(true);
    setResult(null);
    try {
      const secret = process.env.NEXT_PUBLIC_CRON_SECRET ?? "";
      const url = secret
        ? `/api/agent/nudge?secret=${secret}`
        : "/api/agent/nudge";
      const res = await fetch(url, { method: "POST" });
      const data = await res.json();
      const count = data.actions?.length ?? 0;
      setResult(
        count > 0
          ? `Agent: ${count} action(s) taken`
          : "Agent: no stale POs needed nudging"
      );
    } catch {
      setResult("Agent check failed");
    } finally {
      setRunning(false);
    }
  }, []);

  const triggerDigest = useCallback(async () => {
    setRunning(true);
    try {
      const secret = process.env.NEXT_PUBLIC_CRON_SECRET ?? "";
      const res = await fetch(`/api/cron/digest?secret=${secret}`, {
        method: "POST",
      });
      const data = await res.json();
      setResult(data.message ?? "Digest generated");
    } catch {
      setResult("Digest failed");
    } finally {
      setRunning(false);
    }
  }, []);

  return { running, result, triggerNudge, triggerDigest, clearResult: () => setResult(null) };
}
