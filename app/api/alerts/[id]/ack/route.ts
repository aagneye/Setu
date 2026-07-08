import { acknowledgeAlert } from "@/lib/db/alerts";
import { ok, notFound } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const alert = await acknowledgeAlert(params.id);
    return ok(alert);
  } catch {
    return notFound("Alert not found");
  }
}
