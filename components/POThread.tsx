"use client";

import { Badge } from "@/components/ui/badge";
import type { POUpdate } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Bot, MessageSquare, User } from "lucide-react";

interface POThreadProps {
  updates: POUpdate[];
}

export function POThread({ updates }: POThreadProps) {
  if (updates.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No messages yet. Vendor updates will appear here.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {updates.map((update) => (
        <div
          key={update.id}
          className={`flex gap-3 ${
            update.source === "agent_nudge" ? "opacity-80" : ""
          }`}
        >
          <div className="shrink-0 mt-1">
            {update.source === "agent_nudge" ? (
              <Bot className="h-5 w-5 text-primary" />
            ) : update.source === "vendor_whatsapp" ? (
              <User className="h-5 w-5 text-green-600" />
            ) : (
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium capitalize">
                {update.source.replace("_", " ")}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(update.created_at)}
              </span>
              {update.new_status && (
                <Badge variant="secondary" className="text-xs">
                  → {update.new_status}
                </Badge>
              )}
            </div>
            {update.raw_message && (
              <p className="text-sm bg-muted rounded-lg p-3">
                {update.raw_message}
              </p>
            )}
            {update.extracted_json && (
              <div className="text-xs text-muted-foreground bg-secondary/50 rounded p-2">
                <p>
                  Extracted:{" "}
                  {update.extracted_json.po_number ?? "—"} ·{" "}
                  {update.extracted_json.new_status} · ETA:{" "}
                  {update.extracted_json.new_eta ?? "—"}
                </p>
                {update.extracted_json.delay_reason && (
                  <p>Reason: {update.extracted_json.delay_reason}</p>
                )}
                {"suggested_reply_to_vendor" in update.extracted_json && (
                  <p className="italic mt-1">
                    Reply: {update.extracted_json.suggested_reply_to_vendor}
                  </p>
                )}
              </div>
            )}
            {update.delay_reason && !update.extracted_json && (
              <p className="text-xs text-orange-600">
                Delay: {update.delay_reason}
              </p>
            )}
            {update.media_url && (
              <p className="text-xs text-blue-600 truncate">
                📎 Media attached
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
