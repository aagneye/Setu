import { getSupabaseAdmin } from "@/lib/supabase";

export async function isMessageProcessed(messageSid: string): Promise<boolean> {
  const { data } = await getSupabaseAdmin()
    .from("webhook_idempotency")
    .select("message_sid")
    .eq("message_sid", messageSid)
    .single();
  return Boolean(data);
}

export async function markMessageProcessed(messageSid: string): Promise<void> {
  await getSupabaseAdmin()
    .from("webhook_idempotency")
    .upsert({ message_sid: messageSid, processed_at: new Date().toISOString() });
}

export async function pruneOldIdempotencyKeys(olderThanDays = 7): Promise<void> {
  const cutoff = new Date(
    Date.now() - olderThanDays * 24 * 60 * 60 * 1000
  ).toISOString();
  await getSupabaseAdmin()
    .from("webhook_idempotency")
    .delete()
    .lt("processed_at", cutoff);
}
