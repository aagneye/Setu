export function isAudioMime(type: string | null): boolean {
  return Boolean(type?.startsWith("audio/"));
}

export function isImageMime(type: string | null): boolean {
  return Boolean(type?.startsWith("image/"));
}

export function hasMedia(numMedia: number, mediaUrl: string | null): boolean {
  return numMedia > 0 && Boolean(mediaUrl);
}

export function isDeliveryKeyword(body: string): boolean {
  const lower = body.toLowerCase();
  const keywords = [
    "delivered",
    "delivery",
    "dispatch",
    "bhej",
    "pahunch",
    "पहुंच",
    "भेज",
  ];
  return keywords.some((k) => lower.includes(k));
}
