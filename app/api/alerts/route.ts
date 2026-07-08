import { listActiveAlerts } from "@/lib/db/alerts";
import { ok, created } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { createAlert } from "@/lib/db/alerts";

export async function GET() {
  try {
    const alerts = await listActiveAlerts();
    return ok(alerts);
  } catch (err) {
    return handleApiError(err, "alerts");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.message || !body.alert_type) {
      return Response.json(
        { error: "message and alert_type required" },
        { status: 400 }
      );
    }
    const alert = await createAlert({
      po_id: body.po_id ?? null,
      alert_type: body.alert_type,
      severity: body.severity ?? "warning",
      message: body.message,
    });
    return created(alert);
  } catch (err) {
    return handleApiError(err, "alerts");
  }
}
