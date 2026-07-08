import { NextResponse } from "next/server";
import { routeWebhook } from "@/lib/pipeline/webhook-router";
import {
  parseTwilioWebhook,
  validateTwilioSignature,
} from "@/lib/validators/twilio";
import { logger } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";
import { twilioOk } from "@/lib/api/response";

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    if (!checkRateLimit(`webhook:${ip}`, 120, 60_000)) {
      logger.warn("Webhook rate limited", { pipeline: "webhook", ip });
      return twilioOk();
    }

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

    return twilioOk();
  } catch (err) {
    logger.error("Webhook handler error", {
      pipeline: "webhook",
      error: String(err),
    });
    return twilioOk();
  }
}
