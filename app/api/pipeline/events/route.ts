import { NextResponse } from "next/server";
import { verifyCronAuth } from "@/lib/auth/cron";
import { getRecentPipelineEvents } from "@/lib/db/pipeline-events";
import { isPipelineError } from "@/lib/errors";

export async function GET(request: Request) {
  try {
    verifyCronAuth(request);
  } catch (err) {
    if (isPipelineError(err)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw err;
  }

  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get("limit") ?? "50", 10);
  const events = await getRecentPipelineEvents(limit);

  return NextResponse.json({ events, count: events.length });
}
