"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PurchaseOrder } from "@/lib/types";
import { formatDate, isOverdue } from "@/lib/utils";
import { AlertTriangle, Truck } from "lucide-react";

interface POCardProps {
  po: PurchaseOrder;
  escalated?: boolean;
}

export function POCard({ po, escalated }: POCardProps) {
  const overdue =
    po.status !== "delivered" && isOverdue(po.due_date, po.current_eta);
  const criticalRisk = po.is_critical_path && overdue;

  return (
    <Link href={`/dashboard/po/${po.id}`}>
      <Card
        className={`cursor-pointer transition-shadow hover:shadow-md ${
          criticalRisk
            ? "border-destructive border-2"
            : escalated
              ? "border-orange-500 border-2"
              : ""
        }`}
      >
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold">{po.po_number}</CardTitle>
            {criticalRisk && (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            )}
            {escalated && (
              <Badge variant="destructive" className="text-xs">
                Escalated
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2">
          <p className="text-sm font-medium line-clamp-2">
            {po.item_description}
          </p>
          <p className="text-xs text-muted-foreground">
            {po.quantity} {po.unit} · {po.vendors?.name ?? "Unknown vendor"}
          </p>
          <div className="flex items-center justify-between text-xs">
            <span className={overdue ? "text-destructive font-medium" : ""}>
              Due: {formatDate(po.due_date)}
            </span>
            {po.current_eta && po.current_eta !== po.due_date && (
              <span className="flex items-center gap-1 text-orange-600">
                <Truck className="h-3 w-3" />
                ETA: {formatDate(po.current_eta)}
              </span>
            )}
          </div>
          {po.is_critical_path && (
            <Badge variant="outline" className="text-xs">
              Critical Path
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
