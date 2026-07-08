import { getSupabaseAdmin } from "@/lib/supabase";
import { logger } from "@/lib/logger";

const BUCKET = "delivery-photos";

export async function uploadDeliveryPhoto(
  poId: string,
  buffer: ArrayBuffer,
  contentType: string
): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  const ext = contentType.includes("png") ? "png" : "jpg";
  const path = `${poId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType, upsert: false });

  if (error) {
    logger.warn("Photo upload failed, using Twilio URL", {
      pipeline: "storage",
      error: error.message,
    });
    return null;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
