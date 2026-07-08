"use client";

import { Badge } from "@/components/ui/badge";

interface PipelineStatusBadgeProps {
  eventType: string;
}

const COLORS: Record<string, string> = {
  webhook_received: "bg-blue-100 text-blue-800",
  voice_transcribed: "bg-purple-100 text-purple-800",
  text_extracted: "bg-indigo-100 text-indigo-800",
  photo_verified: "bg-green-100 text-green-800",
  po_updated: "bg-emerald-100 text-emerald-800",
  nudge_sent: "bg-amber-100 text-amber-800",
  escalated: "bg-red-100 text-red-800",
  error: "bg-red-200 text-red-900",
};

export function PipelineStatusBadge({ eventType }: PipelineStatusBadgeProps) {
  const color = COLORS[eventType] ?? "bg-gray-100 text-gray-800";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      {eventType.replace(/_/g, " ")}
    </span>
  );
}
