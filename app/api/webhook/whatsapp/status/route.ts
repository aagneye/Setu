import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  const formData = await request.formData();
  const messageSid = formData.get("MessageSid");
  const messageStatus = formData.get("MessageStatus");
  const to = formData.get("To");

  logger.info("Twilio status callback", {
    pipeline: "webhook",
    event: "status_callback",
    messageSid,
    messageStatus,
    to,
  });

  return new NextResponse("OK", { status: 200 });
}
