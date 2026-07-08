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

export {
  parseTwilioWebhook,
  validateTwilioSignature,
} from "@/lib/validators/twilio";
export type { TwilioWebhookPayload } from "@/lib/validators/twilio";
