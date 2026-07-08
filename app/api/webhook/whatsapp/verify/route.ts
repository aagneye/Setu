import { ok } from "@/lib/api/response";

export async function GET() {
  return ok({
    status: "ok",
    webhook: "/api/webhook/whatsapp",
    method: "POST",
    platform: "twilio-whatsapp",
    message: "Setu webhook endpoint is live",
  });
}
