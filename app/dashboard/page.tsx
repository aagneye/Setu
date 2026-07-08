"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertBanner } from "@/components/AlertBanner";
import { KanbanBoard } from "@/components/KanbanBoard";
import { StatsBar } from "@/components/StatsBar";
import { SearchBar } from "@/components/SearchBar";
import { useStats } from "@/hooks/useStats";
import { useAgent } from "@/hooks/useAgent";
import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { useDashboardOverview } from "@/hooks/useDashboardOverview";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabase";
import type { PurchaseOrder } from "@/lib/types";
import { Loader2, RefreshCw, Zap } from "lucide-react";

export default function DashboardPage() {
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [escalatedIds, setEscalatedIds] = useState<Set<string>>(new Set());
  const [escalatedPOs, setEscalatedPOs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { stats, loading: statsLoading } = useStats();
  const { stats: overviewStats, events } = useDashboardOverview();
  const { running: triggering, result: agentResult, triggerNudge, triggerDigest } = useAgent();

  const fetchData = useCallback(async () => {
    const supabase = getSupabaseClient();

    const [poRes, nudgeRes] = await Promise.all([
      supabase
        .from("purchase_orders")
        .select("*, vendors(*)")
        .order("due_date", { ascending: true }),
      supabase
        .from("nudges")
        .select("po_id, escalated_to_pm, purchase_orders(po_number)")
        .eq("escalated_to_pm", true),
    ]);

    if (poRes.data) setPos(poRes.data as PurchaseOrder[]);

    if (nudgeRes.data) {
      const ids = new Set(nudgeRes.data.map((n) => n.po_id));
      setEscalatedIds(ids);
      setEscalatedPOs(
        nudgeRes.data
          .map((n) => {
            const po = n.purchase_orders as unknown as { po_number: string } | null;
            return po?.po_number;
          })
          .filter((x): x is string => Boolean(x))
      );
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();

    const supabase = getSupabaseClient();
    const channel = supabase
      .channel("dashboard-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "purchase_orders" },
        () => fetchData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "po_updates" },
        () => fetchData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "nudges" },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  async function triggerAgent() {
    await triggerNudge();
    await fetchData();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Setu <span className="text-primary">सेतु</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Live procurement tracker · Site A
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button size="sm" variant="outline" onClick={triggerDigest} disabled={triggering}>
              Digest
            </Button>
            <Button size="sm" onClick={triggerAgent} disabled={triggering}>
              {triggering ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              Trigger Agent Check
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <OverviewCards stats={overviewStats} />
        <StatsBar stats={stats} loading={statsLoading} />
        <div className="mb-4">
          <RecentActivity events={events} />
        </div>
        <div className="mb-4">
          <SearchBar />
        </div>
        <AlertBanner pos={pos} escalatedPOs={escalatedPOs} />
        {agentResult && (
          <p className="text-sm text-primary mb-4 font-medium">{agentResult}</p>
        )}
        {pos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">
              No purchase orders yet. Run the seed script to load demo data.
            </p>
            <code className="text-sm bg-muted px-3 py-1 rounded">
              npm run seed
            </code>
          </div>
        ) : (
          <KanbanBoard pos={pos} escalatedIds={escalatedIds} />
        )}
      </main>
    </div>
  );
}
