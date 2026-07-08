"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { POThread } from "@/components/POThread";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GRN, POWithDetails } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, CheckCircle, Loader2, XCircle } from "lucide-react";

export default function PODetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [po, setPo] = useState<POWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/po/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setPo(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!po || "error" in po) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">PO not found</p>
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button asChild variant="ghost" size="sm" className="mb-2">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{po.po_number}</h1>
            <Badge>{STATUS_LABELS[po.status]}</Badge>
            {po.is_critical_path && (
              <Badge variant="destructive">Critical Path</Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">{po.item_description}</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="p-4 pb-1">
              <CardTitle className="text-xs text-muted-foreground">
                Quantity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-lg font-semibold">
              {po.quantity} {po.unit}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 pb-1">
              <CardTitle className="text-xs text-muted-foreground">
                Due Date
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-lg font-semibold">
              {formatDate(po.due_date)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 pb-1">
              <CardTitle className="text-xs text-muted-foreground">
                Current ETA
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-lg font-semibold">
              {po.current_eta ? formatDate(po.current_eta) : "—"}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 pb-1">
              <CardTitle className="text-xs text-muted-foreground">
                Vendor
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-lg font-semibold">
              {po.vendors?.name ?? "—"}
            </CardContent>
          </Card>
        </div>

        {po.grns && po.grns.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">GRN Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {po.grns.map((grn: GRN) => (
                <div
                  key={grn.id}
                  className="flex items-start gap-3 p-3 bg-muted rounded-lg"
                >
                  {grn.verified_item_match ? (
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive shrink-0" />
                  )}
                  <div className="text-sm space-y-1">
                    <p>
                      Item match:{" "}
                      <strong>
                        {grn.verified_item_match ? "Yes" : "No / Review"}
                      </strong>
                    </p>
                    {grn.verified_quantity && (
                      <p>Qty verified: {grn.verified_quantity}</p>
                    )}
                    {grn.mismatch_notes && (
                      <p className="text-orange-600">{grn.mismatch_notes}</p>
                    )}
                    {grn.vision_raw_response && (
                      <p className="text-muted-foreground">
                        Visible: {grn.vision_raw_response.item_visible} ·
                        Recommendation:{" "}
                        {grn.vision_raw_response.grn_recommendation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Message Thread</CardTitle>
          </CardHeader>
          <CardContent>
            <POThread updates={po.po_updates ?? []} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
