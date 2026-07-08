import type { PipelineEvent } from "@/lib/pipeline/types";

export function HistoryTable({ events }: { events: PipelineEvent[] }) {
  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left px-3 py-2">Time</th>
            <th className="text-left px-3 py-2">Event</th>
            <th className="text-left px-3 py-2">PO</th>
            <th className="text-left px-3 py-2">Pipeline</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.id} className="border-t">
              <td className="px-3 py-2 text-muted-foreground">
                {e.created_at
                  ? new Date(e.created_at).toLocaleString("en-IN")
                  : ""}
              </td>
              <td className="px-3 py-2 capitalize">
                {e.event_type.replaceAll("_", " ")}
              </td>
              <td className="px-3 py-2">{e.po_number ?? "-"}</td>
              <td className="px-3 py-2">{e.pipeline}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
