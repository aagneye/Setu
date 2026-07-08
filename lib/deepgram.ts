import { createClient } from "@deepgram/sdk";

export async function transcribeAudio(
  audioBuffer: ArrayBuffer,
  mimeType: string
): Promise<string> {
  const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

  const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
    Buffer.from(audioBuffer),
    {
      model: "nova-2",
      language: "hi",
      smart_format: true,
      detect_language: true,
    }
  );

  if (error) throw error;

  const transcript =
    result?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? "";
  return transcript.trim();
}

export async function downloadTwilioMedia(
  mediaUrl: string,
  accountSid: string,
  authToken: string
): Promise<{ buffer: ArrayBuffer; contentType: string }> {
  const response = await fetch(mediaUrl, {
    headers: {
      Authorization:
        "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download media: ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  const contentType = response.headers.get("content-type") ?? "audio/ogg";
  return { buffer, contentType };
}
