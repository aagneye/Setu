import { NextResponse } from "next/server";
import { routeWebhook } from "@/lib/pipeline/webhook-router";
import {
  parseTwilioWebhook,
  validateTwilioSignature,
} from "@/lib/validators/twilio";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    if (process.env.NODE_ENV === "production") {
      const valid = validateTwilioSignature(request, formData);
      if (!valid) {
        logger.warn("Invalid Twilio signature", { pipeline: "webhook" });
        return new NextResponse("Forbidden", { status: 403 });
      }
    }

    const payload = parseTwilioWebhook(formData);
    await routeWebhook(payload);

    return new NextResponse("OK", { status: 200 });
  } catch (err) {
    logger.error("Webhook handler error", {
      pipeline: "webhook",
      error: String(err),
    });
    return new NextResponse("OK", { status: 200 });
  }
}
