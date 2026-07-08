import { findVendorByPhone } from "@/lib/db/vendors";
import { getOpenPOsForVendor } from "@/lib/db/purchase-orders";
import { downloadTwilioMedia } from "@/lib/deepgram";
import { sendWhatsAppMessage } from "@/lib/twilio";
import { handleTextMessage } from "@/lib/pipeline/text-handler";
import { handleVoiceMessage } from "@/lib/pipeline/voice-handler";
import { handlePhotoMessage } from "@/lib/pipeline/photo-handler";
import { logPipelineEvent } from "@/lib/db/pipeline-events";
import { PIPELINE_EVENTS } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { isPipelineError } from "@/lib/errors";
import { unknownVendorReply, emptyMessageReply, pipelineErrorReply } from "@/lib/messaging/replies";
import type { TwilioWebhookPayload } from "@/lib/validators/twilio";
import type { PipelineResult } from "@/lib/pipeline/types";

export async function routeWebhook(
  payload: TwilioWebhookPayload
): Promise<PipelineResult> {
  const { from, body, numMedia, mediaUrl, mediaContentType, messageSid } =
    payload;

  await logPipelineEvent({
    event_type: PIPELINE_EVENTS.WEBHOOK_RECEIVED,
    pipeline: "webhook",
    vendor_phone: from,
    payload: { body, numMedia, messageSid, mediaContentType },
  });

  const vendor = await findVendorByPhone(from);
  if (!vendor) {
    await logPipelineEvent({
      event_type: PIPELINE_EVENTS.VENDOR_NOT_FOUND,
      pipeline: "webhook",
      vendor_phone: from,
    });
    const reply = unknownVendorReply();
    await sendWhatsAppMessage(from, reply);
    return { success: false, action: "vendor_not_found", reply };
  }

  const openPOs = await getOpenPOsForVendor(vendor.id);

  try {
    if (numMedia > 0 && mediaUrl) {
      const { buffer } = await downloadTwilioMedia(
        mediaUrl,
        process.env.TWILIO_ACCOUNT_SID!,
        process.env.TWILIO_AUTH_TOKEN!
      );

      if (mediaContentType?.startsWith("image/")) {
        const result = await handlePhotoMessage(
          openPOs,
          buffer,
          mediaContentType,
          mediaUrl,
          body,
          from
        );
        if (result.reply) await sendWhatsAppMessage(from, result.reply);
        return result;
      }

      if (mediaContentType?.startsWith("audio/")) {
        const result = await handleVoiceMessage(
          openPOs,
          buffer,
          mediaContentType,
          from,
          mediaUrl
        );
        if (result.reply) await sendWhatsAppMessage(from, result.reply);
        return result;
      }
    }

    if (body.trim()) {
      const result = await handleTextMessage(openPOs, body, from);
      if (result.reply) await sendWhatsAppMessage(from, result.reply);
      return result;
    }

    const reply = emptyMessageReply();
    await sendWhatsAppMessage(from, reply);
    return { success: false, action: "empty_message", reply };
  } catch (err) {
    const message = isPipelineError(err) ? err.message : String(err);
    logger.error("Pipeline error", {
      pipeline: "webhook",
      vendor_phone: from,
      event: PIPELINE_EVENTS.ERROR,
    });

    await logPipelineEvent({
      event_type: PIPELINE_EVENTS.ERROR,
      pipeline: "webhook",
      vendor_phone: from,
      error_message: message,
    });

    const reply = pipelineErrorReply();
    await sendWhatsAppMessage(from, reply);
    return { success: false, action: "error", error: message, reply };
  }
}
