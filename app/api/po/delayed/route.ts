import { listAllPOs } from "@/lib/db/purchase-orders";
import { isOverdue } from "@/lib/utils";
import { ok } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";

export async function GET() {
  try {
    const pos = await listAllPOs();
    const delayed = pos.filter(
      (p) =>
        p.status === "delayed" ||
        (p.status !== "delivered" && isOverdue(p.due_date, p.current_eta))
    );
    return ok(delayed);
  } catch (err) {
    return handleApiError(err, "po-delayed");
  }
}
