import { ok, serverError } from "@/lib/api/response";
import { getRecentPipelineEvents } from "@/lib/db/pipeline-events";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? "100");
    const events = await getRecentPipelineEvents(Math.min(limit, 500));
    return ok({ events });
  } catch (err) {
    return serverError(String(err));
  }
}
