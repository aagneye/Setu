import { NextResponse } from "next/server";
import { verifyCronAuth } from "@/lib/auth/cron";
import { runAgentLoop } from "@/lib/agent/run";
import { isPipelineError } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    verifyCronAuth(request);
  } catch (err) {
    if (isPipelineError(err)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw err;
  }

  const result = await runAgentLoop();
  return NextResponse.json(result);
}

export async function GET(request: Request) {
  return POST(request);
}
