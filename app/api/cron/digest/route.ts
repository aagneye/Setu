import { verifyCronAuth } from "@/lib/auth/cron";
import { sendDigestToPM } from "@/lib/agent/digest-sender";
import { isPipelineError } from "@/lib/errors";
import { unauthorized } from "@/lib/api/response";

export async function POST(request: Request) {
  try {
    verifyCronAuth(request);
  } catch (err) {
    if (isPipelineError(err)) return unauthorized();
    throw err;
  }

  const message = await sendDigestToPM();
  return Response.json({ sent: true, message });
}

export async function GET(request: Request) {
  return POST(request);
}
