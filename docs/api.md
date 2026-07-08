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

## Error responses

| Status | When |
|--------|------|
| `401` | Agent nudge called without valid `CRON_SECRET` |
| `404` | PO not found (`GET /api/po/[id]`) |
| `500` | Supabase or AI service error |
