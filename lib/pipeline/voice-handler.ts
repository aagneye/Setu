import { transcribeAudio } from "@/lib/deepgram";
import { handleTextMessage } from "@/lib/pipeline/text-handler";
import { logPipelineEvent } from "@/lib/db/pipeline-events";
import { PIPELINE_EVENTS } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { TranscriptionError } from "@/lib/errors";
import type { PurchaseOrder } from "@/lib/types";
import type { PipelineResult } from "@/lib/pipeline/types";

export async function handleVoiceMessage(
  openPOs: PurchaseOrder[],
  audioBuffer: ArrayBuffer,
  mimeType: string,
  vendorPhone: string,
  mediaUrl?: string | null
): Promise<PipelineResult> {
  const start = Date.now();
  let transcript: string;

  try {
    transcript = await transcribeAudio(audioBuffer, mimeType);
  } catch (err) {
    throw new TranscriptionError(String(err));
  }

  if (!transcript.trim()) {
    return {
      success: false,
      action: "empty_transcript",
      reply: "Voice note sunai nahi diya. Phir se bhejein ya text mein likhein.",
    };
  }

  await logPipelineEvent({
    event_type: PIPELINE_EVENTS.VOICE_TRANSCRIBED,
    pipeline: "voice",
    vendor_phone: vendorPhone,
    payload: { transcript },
    duration_ms: Date.now() - start,
  });

  logger.info("Voice transcribed", {
    pipeline: "voice",
    vendor_phone: vendorPhone,
    event: PIPELINE_EVENTS.VOICE_TRANSCRIBED,
  });

  return handleTextMessage(openPOs, transcript, vendorPhone, mediaUrl);
}
