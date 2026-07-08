"use client";

import { AlertsPanel } from "@/components/AlertsPanel";
import { useAlerts } from "@/hooks/useAlerts";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function AlertsPage() {
  const { alerts, loading, acknowledge } = useAlerts();

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-2">Alerts</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Escalations and procurement warnings
      </p>

      {alerts.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No active alerts. All clear.
        </p>
      ) : (
        <AlertsPanel alerts={alerts} onAcknowledge={acknowledge} />
      )}

      <p className="text-center mt-6">
        <Link href="/dashboard" className="text-sm text-primary hover:underline">
          ← Back to Kanban
        </Link>
      </p>
    </div>
  );
}
