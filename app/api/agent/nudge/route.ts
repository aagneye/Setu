import { NextResponse } from "next/server";
import { generateNudgeMessage } from "@/lib/claude";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendWhatsAppMessage } from "@/lib/twilio";
import { daysOverdue } from "@/lib/utils";

const STALE_HOURS = 24;
const NUDGE_WINDOW_DAYS = 7;

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    const url = new URL(request.url);
    const secretParam = url.searchParams.get("secret");
    if (secretParam !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabase = getSupabaseAdmin();
  const staleCutoff = new Date(
    Date.now() - STALE_HOURS * 60 * 60 * 1000
  ).toISOString();
  const windowCutoff = new Date(
    Date.now() + NUDGE_WINDOW_DAYS * 24 * 60 * 60 * 1000
  )
    .toISOString()
    .split("T")[0];

  const { data: pos, error } = await supabase
    .from("purchase_orders")
    .select("*, vendors(*)")
    .neq("status", "delivered")
    .lte("due_date", windowCutoff);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results: Array<{
    po_number: string;
    action: string;
    message?: string;
  }> = [];

  for (const po of pos ?? []) {
    const { data: recentUpdates } = await supabase
      .from("po_updates")
      .select("created_at")
      .eq("po_id", po.id)
      .gte("created_at", staleCutoff)
      .limit(1);

    if (recentUpdates && recentUpdates.length > 0) continue;

    const { data: existingNudges } = await supabase
      .from("nudges")
      .select("*")
      .eq("po_id", po.id)
      .order("nudge_number", { ascending: false });

    const nudgeCount = existingNudges?.length ?? 0;
    const latestNudge = existingNudges?.[0];
    const overdue = daysOverdue(po.due_date);

    if (nudgeCount >= 2 && latestNudge && !latestNudge.responded) {
      if (!latestNudge.escalated_to_pm) {
        await supabase
          .from("nudges")
          .update({ escalated_to_pm: true })
          .eq("id", latestNudge.id);

        results.push({
          po_number: po.po_number,
          action: "escalated",
        });
      }
      continue;
    }

    if (nudgeCount >= 2) continue;

    const nextNudgeNumber = nudgeCount + 1;
    const message = await generateNudgeMessage(
      po.po_number,
      po.item_description,
      po.due_date,
      overdue,
      nextNudgeNumber
    );

    const vendor = po.vendors as { phone: string } | null;
    if (vendor?.phone) {
      await sendWhatsAppMessage(vendor.phone, message);
    }

    await supabase.from("nudges").insert({
      po_id: po.id,
      nudge_number: nextNudgeNumber,
    });

    await supabase.from("po_updates").insert({
      po_id: po.id,
      source: "agent_nudge",
      raw_message: message,
    });

    results.push({
      po_number: po.po_number,
      action: `nudge_${nextNudgeNumber}`,
      message,
    });
  }

  return NextResponse.json({
    checked: pos?.length ?? 0,
    actions: results,
  });
}

export async function GET(request: Request) {
  return POST(request);
}
