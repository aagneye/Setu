import { NextResponse } from "next/server";
import { verifyCronAuth } from "@/lib/auth/cron";
import { buildDailyDigest, formatDigestMessage } from "@/lib/digest/build";

export async function POST(request: Request) {
  try {
    verifyCronAuth(request);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const digest = await buildDailyDigest();
  const message = formatDigestMessage(digest);

  return NextResponse.json({ digest, message });
}

export async function GET(request: Request) {
  return POST(request);
}
