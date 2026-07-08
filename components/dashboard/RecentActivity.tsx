import type { PipelineEvent } from "@/lib/pipeline/types";

export function RecentActivity({ events }: { events: PipelineEvent[] }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <h3 className="font-semibold mb-3">Recent Activity</h3>
      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">No recent events.</p>
      ) : (
        <div className="space-y-2">
          {events.slice(0, 8).map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between text-sm border-b pb-2 last:border-b-0"
            >
              <p className="capitalize">{e.event_type.replaceAll("_", " ")}</p>
              <p className="text-xs text-muted-foreground">
                {e.created_at
                  ? new Date(e.created_at).toLocaleTimeString("en-IN")
                  : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
