import twilio from "twilio";

function getClient() {
  return twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  );
}

export async function sendWhatsAppMessage(to: string, body: string) {
  const client = getClient();
  const from = process.env.TWILIO_WHATSAPP_NUMBER!;

  const toNumber = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;

  return client.messages.create({
    from,
    to: toNumber,
    body,
  });
}

export function parseTwilioWebhook(formData: FormData) {
  return {
    from: formData.get("From") as string,
    body: (formData.get("Body") as string) ?? "",
    numMedia: parseInt((formData.get("NumMedia") as string) ?? "0", 10),
    mediaUrl: (formData.get("MediaUrl0") as string) ?? null,
    mediaContentType: (formData.get("MediaContentType0") as string) ?? null,
  };
}
