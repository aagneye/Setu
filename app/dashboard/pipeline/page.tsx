"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PipelineStatusBadge } from "@/components/PipelineStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PipelineEvent } from "@/lib/pipeline/types";
import { Loader2, RefreshCw } from "lucide-react";

export default function PipelinePage() {
  const [events, setEvents] = useState<PipelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchEvents() {
    setLoading(true);
    const secret = process.env.NEXT_PUBLIC_CRON_SECRET ?? "";
    const res = await fetch(`/api/pipeline/events?secret=${secret}`);
    if (res.ok) {
      const data = await res.json();
      setEvents(data.events ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Pipeline Events</h1>
          <p className="text-sm text-muted-foreground">
            Server audit log — every webhook and agent action
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchEvents}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No pipeline events yet. Send a WhatsApp message to generate events.
        </p>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <PipelineStatusBadge eventType={event.event_type} />
                  <span className="text-xs text-muted-foreground">
                    {event.created_at
                      ? new Date(event.created_at).toLocaleString("en-IN")
                      : ""}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-sm">
                <p className="text-muted-foreground">
                  pipeline: {event.pipeline}
                  {event.po_number && ` · ${event.po_number}`}
                  {event.duration_ms != null && ` · ${event.duration_ms}ms`}
                </p>
                {event.error_message && (
                  <p className="text-destructive text-xs mt-1">
                    {event.error_message}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-center mt-6">
        <Link href="/dashboard" className="text-sm text-primary hover:underline">
          ← Back to Kanban
        </Link>
      </p>
    </div>
  );
}
