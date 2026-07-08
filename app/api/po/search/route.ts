import { getSupabaseAdmin } from "@/lib/supabase";
import { ok } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.trim();
    if (!q) {
      return Response.json({ error: "q query param required" }, { status: 400 });
    }

    const { data, error } = await getSupabaseAdmin()
      .from("purchase_orders")
      .select("*, vendors(*)")
      .or(
        `po_number.ilike.%${q}%,item_description.ilike.%${q}%,project_site.ilike.%${q}%`
      )
      .order("due_date", { ascending: true })
      .limit(20);

    if (error) throw error;
    return ok(data ?? []);
  } catch (err) {
    return handleApiError(err, "po-search");
  }
}
