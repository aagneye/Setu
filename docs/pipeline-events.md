# Pipeline Events Reference

Every server action is logged to the `pipeline_events` table for audit and debugging.

---

## Event types

| Event | Pipeline | When |
|-------|----------|------|
| `webhook_received` | webhook | Twilio POST arrives |
| `voice_transcribed` | voice | Deepgram returns transcript |
| `text_extracted` | text | Claude returns structured JSON |
| `photo_verified` | photo | Claude Vision GRN check complete |
| `po_updated` | text/photo | `purchase_orders` row updated |
| `nudge_sent` | agent | WhatsApp nudge sent to vendor |
| `escalated` | agent | PM escalation triggered |
| `vendor_not_found` | webhook | Unknown phone number |
| `error` | any | Pipeline error caught |

---

## Query events

```bash
# API (requires CRON_SECRET)
curl "https://<domain>/api/pipeline/events?secret=YOUR_SECRET&limit=20"
```

```sql
-- Supabase SQL
SELECT event_type, pipeline, po_number, created_at, duration_ms
FROM pipeline_events
ORDER BY created_at DESC
LIMIT 20;
```

---

## Dashboard

View live at `/dashboard/pipeline` (requires `NEXT_PUBLIC_CRON_SECRET` in env).

---

## Schema

See `supabase/migrations/002_pipeline_events.sql`.

---

## Idempotency

Twilio may retry webhooks. Message SIDs are tracked in `webhook_idempotency` table (migration 005) to prevent duplicate processing.
