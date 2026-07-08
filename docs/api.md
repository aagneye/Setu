# API Reference

All API routes live under `app/api/` and deploy as Vercel serverless functions. These are the server-owned workflow endpoints — the core of Setu.

Base URL: `https://<your-vercel-domain>` (local: `http://localhost:3000`)

---

## `POST /api/webhook/whatsapp`

**Twilio inbound webhook.** Receives vendor WhatsApp messages and runs the full ingestion pipeline.

### Request

Twilio sends `application/x-www-form-urlencoded` POST with fields:

| Field | Description |
|-------|-------------|
| `From` | Sender WhatsApp number, e.g. `whatsapp:+919876543210` |
| `Body` | Text message body (may be empty for media-only) |
| `NumMedia` | Number of attached media files |
| `MediaUrl0` | URL of first media attachment |
| `MediaContentType0` | MIME type, e.g. `audio/ogg`, `image/jpeg` |

### Processing branches

| Input type | Pipeline |
|------------|----------|
| Text | Claude extraction → update PO → reply |
| Voice (`audio/*`) | Deepgram transcribe → Claude extraction → update PO → reply |
| Photo (`image/*`) | Claude Vision GRN check → insert `grns` row → update PO if approved → reply |

### Response

`200 OK` with body `"OK"` — Twilio requires a 2xx response.

### Twilio setup

In Twilio Console → Messaging → Try it out → WhatsApp sandbox:

- **When a message comes in:** `https://<vercel-url>/api/webhook/whatsapp` (POST)

For local dev, use [ngrok](https://ngrok.com): `ngrok http 3000` and paste the ngrok URL.

---

## `POST /api/agent/nudge`

**Agentic nudge loop.** Scans stale POs and sends WhatsApp nudges or escalates.

### Auth

Protected by `CRON_SECRET`. Pass via:

- Header: `Authorization: Bearer <CRON_SECRET>`
- Query param: `?secret=<CRON_SECRET>` (used by dashboard trigger button)

### Logic

1. Query POs where `status != 'delivered'` and `due_date` within 7 days
2. Skip POs with a `po_updates` row in the last 24 hours
3. Per PO nudge count:
   - 0 → send nudge #1 (friendly, Hinglish)
   - 1 → send nudge #2 (firmer)
   - 2+ with no response → set `escalated_to_pm = true` (dashboard alert)

### Response

```json
{
  "checked": 5,
  "actions": [
    { "po_number": "PO-1047", "action": "nudge_1", "message": "Hi Ramesh..." },
    { "po_number": "PO-1043", "action": "escalated" }
  ]
}
```

### Cron

Configured in `vercel.json` — runs every 15 minutes on Vercel:

```json
{ "path": "/api/agent/nudge", "schedule": "*/15 * * * *" }
```

Manual trigger (for demos): click **Trigger Agent Check** on the dashboard.

### `GET /api/agent/nudge`

Alias for `POST` — same handler.

---

## `GET /api/po`

List all purchase orders with vendor details.

### Response

```json
[
  {
    "id": "uuid",
    "po_number": "PO-1042",
    "vendor_id": "uuid",
    "item_description": "TMT Rebar 12mm",
    "quantity": 500,
    "unit": "kg",
    "due_date": "2026-07-09",
    "status": "confirmed",
    "is_critical_path": true,
    "current_eta": "2026-07-09",
    "project_site": "Site A — Tower B Level 5",
    "vendors": { "name": "Ramesh Rebar Supplies", "phone": "whatsapp:+91..." }
  }
]
```

---

## `POST /api/po`

Create a new purchase order.

### Request body

```json
{
  "po_number": "PO-1050",
  "vendor_id": "uuid",
  "item_description": "Cement bags",
  "quantity": 100,
  "unit": "bags",
  "due_date": "2026-07-15",
  "status": "ordered",
  "is_critical_path": false,
  "project_site": "Site A"
}
```

### Response

`201 Created` with the inserted PO object.

---

## `GET /api/po/[id]`

Single PO with full detail: message thread, GRNs, nudge history.

### Response

```json
{
  "id": "uuid",
  "po_number": "PO-1042",
  "...": "...",
  "vendors": { "name": "...", "phone": "..." },
  "po_updates": [
    {
      "source": "vendor_whatsapp",
      "raw_message": "Bhai rebar do din late hoga",
      "extracted_json": { "po_number": "PO-1042", "new_status": "delayed", "...": "..." },
      "new_status": "delayed",
      "created_at": "..."
    }
  ],
  "grns": [],
  "nudges": []
}
```

---

## `GET /api/health`

Liveness and dependency check for hosting platforms.

### Response

```json
{
  "status": "ok",
  "version": "1.0.0-mvp",
  "timestamp": "2026-07-08T...",
  "checks": {
    "env": { "status": "ok" },
    "database": { "status": "ok", "message": "Connected" },
    "twilio": { "status": "ok" },
    "anthropic": { "status": "ok" }
  }
}
```

---

## `GET /api/health/ready`

Readiness probe for Render load balancer. Returns `503` if DB unreachable or env incomplete.

---

## `POST /api/agent/digest`

Generate daily procurement summary. Requires `CRON_SECRET` auth.

### Response

```json
{
  "digest": {
    "total_open": 6,
    "delayed_count": 2,
    "critical_delayed": ["PO-1044 (PVC pipes...)"],
    "message": "2 items delayed — 1 critical path risk"
  },
  "message": "📋 Setu Daily Digest\n..."
}
```

---

## `GET /api/vendors` · `POST /api/vendors`

List all vendors or register a new vendor.

### POST body

```json
{
  "name": "Ramesh Rebar Supplies",
  "phone": "+919876543210",
  "trade": "Rebar",
  "preferred_language": "hi"
}
```

---

## `GET /api/vendors/[id]`

Fetch single vendor by UUID.

---

## `PATCH /api/po/[id]/status`

Manual PO status update (PM override).

### Body

```json
{ "status": "delayed", "current_eta": "2026-07-11" }
```

---

## `GET /api/po/[id]/updates` · `POST /api/po/[id]/updates`

List or manually insert PO update audit rows.

---

## `POST /api/webhook/whatsapp/status`

Twilio delivery status callback. Logs message delivery status.

---

## `GET /api/pipeline/events`

Pipeline audit log. Requires `CRON_SECRET` auth.

### Query params

| Param | Default | Description |
|-------|---------|-------------|
| `limit` | 50 | Max events to return |

---

## Pipeline modules (`lib/`)

| Module | Role |
|--------|------|
| `lib/pipeline/webhook-router.ts` | Central message router |
| `lib/pipeline/text-handler.ts` | Text → Claude → PO update |
| `lib/pipeline/voice-handler.ts` | Voice → Deepgram → text handler |
| `lib/pipeline/photo-handler.ts` | Photo → Claude Vision → GRN |
| `lib/agent/run.ts` | Agent loop orchestrator |
| `lib/db/*` | Database repository layer |
| `lib/db/pipeline-events.ts` | Audit event logging |

---

## Error responses

| Status | When |
|--------|------|
| `401` | Agent nudge called without valid `CRON_SECRET` |
| `404` | PO not found (`GET /api/po/[id]`) |
| `500` | Supabase or AI service error |
