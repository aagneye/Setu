"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { displayPhone } from "@/lib/format/phone";
import type { Vendor } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vendors")
      .then((r) => r.json())
      .then(setVendors)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-2">Vendors</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Registered suppliers connected via WhatsApp
      </p>

      <div className="grid gap-3">
        {vendors.map((v) => (
          <Card key={v.id}>
            <CardHeader className="p-4 pb-1">
              <CardTitle className="text-base">{v.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
              <p>{v.trade ?? "—"} · {displayPhone(v.phone)}</p>
              <Link
                href={`/api/vendors/${v.id}/pos`}
                className="text-xs text-primary hover:underline mt-1 inline-block"
              >
                View open POs (API)
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
