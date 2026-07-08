"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Alert } from "@/lib/db/alerts";

interface AlertsPanelProps {
  alerts: Alert[];
  onAcknowledge?: (id: string) => void;
}

const SEVERITY_COLORS = {
  info: "border-blue-200 bg-blue-50",
  warning: "border-orange-200 bg-orange-50",
  critical: "border-destructive bg-destructive/10",
};

export function AlertsPanel({ alerts, onAcknowledge }: AlertsPanelProps) {
  if (alerts.length === 0) return null;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">
          Active Alerts ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-center justify-between rounded-lg border p-3 ${SEVERITY_COLORS[alert.severity]}`}
          >
            <div>
              <p className="text-sm font-medium">{alert.message}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {alert.alert_type} · {new Date(alert.created_at).toLocaleString("en-IN")}
              </p>
            </div>
            {onAcknowledge && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAcknowledge(alert.id)}
              >
                Ack
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
