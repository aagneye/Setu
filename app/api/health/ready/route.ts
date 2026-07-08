import { NextResponse } from "next/server";
import { runReadinessCheck } from "@/lib/health/checks";

export async function GET() {
  const readiness = await runReadinessCheck();
  if (!readiness.ready) {
    return NextResponse.json(
      { ready: false, reason: readiness.reason },
      { status: 503 }
    );
  }
  return NextResponse.json({ ready: true });
}
