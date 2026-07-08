import { buildDailyDigest, formatDigestMessage } from "@/lib/digest/build";
import { logDigest } from "@/lib/db/digest-log";
import { sendWhatsAppMessage } from "@/lib/twilio";
import { logger } from "@/lib/logger";

export async function sendDigestToPM(pmPhone?: string): Promise<string> {
  const digest = await buildDailyDigest();
  const message = formatDigestMessage(digest);

  await logDigest(digest, message);

  const phone = pmPhone ?? process.env.PM_WHATSAPP_NUMBER;
  if (phone) {
    await sendWhatsAppMessage(phone, message);
    logger.info("Digest sent to PM", { pipeline: "agent", event: "digest_sent" });
  }

  return message;
}
