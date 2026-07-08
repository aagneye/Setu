import { NextResponse } from "next/server";
import { runHealthCheck } from "@/lib/health/checks";

export async function GET() {
  const health = await runHealthCheck();
  const statusCode = health.status === "error" ? 503 : 200;
  return NextResponse.json(health, { status: statusCode });
}
