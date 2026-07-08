# Local Demo Guide — Step by Step

Use this script to rehearse the **full Setu demo** on your laptop before presenting.

**You need:** Supabase configured, `.env.local` filled, seed run, Twilio sandbox joined.

---

## Before you start (5-minute checklist)

```powershell
cd C:\Projects\Setu
npm run dev
```

| Check | URL | Expected |
|-------|-----|----------|
| App running | http://localhost:3000 | Redirects to `/login` |
| Health | http://localhost:3000/api/health | JSON with `"status"` field |
| Webhook verify | http://localhost:3000/api/webhook/whatsapp/verify | `"status": "ok"` |

Open two browser tabs:

- Tab 1: **Dashboard** (after login)
- Tab 2: **Pipeline** → http://localhost:3000/dashboard/pipeline

Keep **WhatsApp** open on vendor phone.

---

## Demo cast

| Role | Device | Who |
|------|--------|-----|
| Vendor Ramesh | Phone A | Sends WhatsApp messages |
| PM Priya | Laptop | Shows dashboard to judges |
| Setu Bot | Server | Automatic |

---

## Scene 1 — PM opens dashboard (30 sec)

1. Go to http://localhost:3000/login
2. Sign in (or sign up once)
3. Show **Overview** tab:
   - Stats bar (open POs, delayed, critical)
   - Kanban columns: Ordered → Confirmed → In Transit → Delayed → Delivered
4. Say: *"This is live procurement — no manual data entry."*

**Show:** PO-1042 (rebar), PO-1044 (delayed, critical path).

---

## Scene 2 — Vendor sends text update (60 sec)

On **vendor phone**, send to Twilio sandbox number:

```text
Bhai PO-1042 rebar do din late hoga, transport mein dikkat hai
```

**On laptop:**

1. Watch PO-1042 card move toward **Delayed**
2. Click PO-1042 → show **message thread** with extracted JSON
3. Say: *"Vendor typed in Hinglish — structured update in seconds."*

**On phone:** Bot should reply confirming the update.

If nothing happens → see [setup-twilio.md](setup-twilio.md) troubleshooting.

---

## Scene 3 — Voice note (60 sec) — optional

Send a **voice note** in Hindi about PO-1042 or PO-1046.

Requires `DEEPGRAM_API_KEY` + `ANTHROPIC_API_KEY`.

Show thread with transcript + extraction.

Say: *"Vendors don't type — they send voice notes. That's how India works."*

---

## Scene 4 — Delivery photo (45 sec) — optional

Send a **photo** (truck, materials, or challan) with text `PO-1046 delivered`.

Requires `ANTHROPIC_API_KEY`.

Show:

- GRN section on PO detail page
- Item match / approve or flag

---

## Scene 5 — Agent nudge (60 sec)

On dashboard, click **Trigger Agent Check**.

Explain: *"No human chased the vendor — the agent did."*

**If a stale PO exists:**

- Vendor phone may receive a WhatsApp nudge
- Escalated PO shows orange/red on dashboard

Open **Alerts** tab: http://localhost:3000/dashboard/alerts

---

## Scene 6 — History & audit (30 sec)

Open **History** tab: http://localhost:3000/dashboard/history

Show pipeline events table — every webhook, extraction, nudge logged.

Say: *"Full audit trail for compliance — not just a chat log."*

---

## Scene 7 — Close (15 sec)

> *"Vendors stay on WhatsApp. Site team gets a live dashboard. The server owns the workflow — nudges, extraction, escalation — before delays hit the critical path."*

Show live URL if deployed.

---

## If live WhatsApp fails on stage

**Fallback plan:**

1. Show pre-seeded PO-1044 (already has Hindi delay update in thread)
2. Show **Pipeline** page with past events
3. Click **Trigger Agent Check** — explain agent loop even if no phone reply
4. Say webhook is configured for production URL

---

## Quick commands reference

```powershell
npm run dev              # start app
npm run seed             # reset demo data
npm run test:health      # check env + DB
npm run test:agent       # list stale POs agent would nudge
npm run check:webhook    # verify webhook endpoint
npx ngrok http 3000      # public URL for Twilio (local)
```

---

## Environment minimum for each demo part

| Demo part | Required keys |
|-----------|---------------|
| Dashboard only | Supabase + AUTH_SECRET |
| Text WhatsApp | + Twilio + Anthropic |
| Voice note | + Deepgram |
| Photo GRN | + Anthropic |
| Agent nudge to phone | + Twilio |

---

## Back to setup

- [setup-beginner.md](setup-beginner.md) — master checklist
- [setup-twilio.md](setup-twilio.md) — WhatsApp connection
- [demo-script.md](demo-script.md) — 2-minute judge video script
