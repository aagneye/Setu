import twilio from "twilio";

export function validateTwilioSignature(
  request: Request,
  formData: FormData
): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) return true;

  const signature = request.headers.get("x-twilio-signature");
  if (!signature) return false;

  const url = request.url;
  const params: Record<string, string> = {};
  formData.forEach((value, key) => {
    params[key] = value.toString();
  });

  return twilio.validateRequest(authToken, signature, url, params);
}

export interface TwilioWebhookPayload {
  from: string;
  body: string;
  numMedia: number;
  mediaUrl: string | null;
  mediaContentType: string | null;
  messageSid: string | null;
}

export function parseTwilioWebhook(formData: FormData): TwilioWebhookPayload {
  return {
    from: formData.get("From") as string,
    body: (formData.get("Body") as string) ?? "",
    numMedia: parseInt((formData.get("NumMedia") as string) ?? "0", 10),
    mediaUrl: (formData.get("MediaUrl0") as string) ?? null,
    mediaContentType: (formData.get("MediaContentType0") as string) ?? null,
    messageSid: (formData.get("MessageSid") as string) ?? null,
  };
}
