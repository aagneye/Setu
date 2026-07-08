# Architecture — Server-Owned Workflow

Setu is not a dashboard with a chatbot bolted on. The **server owns the procurement workflow**. The dashboard is a read-only window into pipeline state that updates in real time.

---

## System diagram

```
┌─────────────┐        ┌──────────────────────┐
│  Vendor's    │──text/voice/photo──▶│  Twilio WhatsApp      │
│  WhatsApp    │◀────reply───────────│  Sandbox (webhook)    │
└─────────────┘        └──────────┬───────────┘
                                   │ POST /api/webhook/whatsapp
                                   ▼
                        ┌──────────────────────┐
                        │  Next.js API Routes   │  ← hosted on Vercel
                        │  (serverless)         │
                        └──────────┬───────────┘
                                   │
                 ┌─────────────────┼─────────────────┐
                 ▼                 ▼                 ▼
      ┌──────────────────┐ ┌───────────────┐ ┌──────────────────┐
      │ Deepgram          │ │ Claude API     │ │ Claude Vision API │
      │ (voice → text)    │ │ (extract JSON) │ │ (photo → GRN)     │
      └──────────┬────────┘ └───────┬───────┘ └─────────┬─────────┘
                 └──────────────────┼───────────────────┘
                                    ▼
                        ┌──────────────────────┐
                        │  PostgreSQL             │  ← Supabase or Neon
                        │  (POs, updates, GRNs)  │
                        └──────────┬───────────┘
                                   │
                 ┌─────────────────┴─────────────────┐
                 ▼                                   ▼
      ┌──────────────────────┐          ┌──────────────────────────┐
      │ Dashboard (Vercel)     │          │ Agent Cron                │
      │ Kanban + PO detail     │          │ POST /api/agent/nudge     │
      │ (read-only view)       │          │ every 15 min via Vercel   │
      └──────────────────────┘          └──────────────────────────┘
```

---

## Pipeline 1 — Vendor message ingestion

**Entry point:** `POST /api/webhook/whatsapp`

This is the core loop. Every vendor interaction flows through here.

```
WhatsApp message arrives (Twilio webhook)
  │
  ├─ Lookup vendor by phone number
  │    └─ Unknown vendor → reply "not registered", return 200
  │
  ├─ Load vendor's open POs from DB
  │
  ├─ Branch on message type:
  │    │
  │    ├─ Voice note (audio/*)
  │    │    └─ Download media → Deepgram transcribe → text
  │    │
  │    ├─ Text message
  │    │    └─ Use body directly
  │    │
  │    └─ Photo (image/*)
  │         └─ Claude Vision → GRN verification → update PO status
  │
  ├─ Claude extraction (text/voice path)
  │    └─ Input: transcript + open POs list
  │    └─ Output: { po_number, new_status, new_eta, delay_reason, reply }
  │
  ├─ Update purchase_orders row (status, current_eta)
  ├─ Insert po_updates audit row (raw + extracted JSON)
  ├─ Mark any pending nudges as responded
  └─ Send confirmation reply via Twilio WhatsApp
```

**Files:** `app/api/webhook/whatsapp/route.ts`, `lib/claude.ts`, `lib/deepgram.ts`, `lib/twilio.ts`

---

## Pipeline 2 — Agentic nudge loop

**Entry point:** `POST /api/agent/nudge` (triggered by Vercel Cron every 15 min, or manually from dashboard)

This is what makes Setu "agentic" — not just logging messages.

```
For each non-delivered PO within 7 days of due date:
  │
  ├─ Skip if vendor sent an update in last 24 hours
  │
  ├─ Check nudge count for this PO:
  │    │
  │    ├─ 0 nudges → send friendly WhatsApp nudge #1
  │    ├─ 1 nudge, no response → send firmer nudge #2
  │    └─ 2 nudges, no response → escalate (dashboard red alert)
  │
  ├─ Insert nudges row
  └─ Insert po_updates row (source: agent_nudge)
```

**Files:** `app/api/agent/nudge/route.ts`, `lib/claude.ts` (nudge message generation), `vercel.json` (cron schedule)

---

## Pipeline 3 — Dashboard read path

The dashboard does **not** own business logic. It subscribes to Supabase realtime and renders state.

```
/dashboard
  └─ Supabase realtime subscription on purchase_orders, po_updates, nudges
  └─ Kanban grouped by status
  └─ AlertBanner for critical-path delays + escalations
  └─ "Trigger Agent Check" button → POST /api/agent/nudge

/dashboard/po/[id]
  └─ GET /api/po/[id] → thread, GRNs, nudge history
```

**Files:** `app/dashboard/page.tsx`, `app/dashboard/po/[id]/page.tsx`, `components/`

---

## What lives where

| Concern | Server (API routes) | Client (dashboard) |
|---------|---------------------|---------------------|
| Message parsing | ✅ | — |
| AI extraction | ✅ | — |
| PO status updates | ✅ | — |
| Nudge / escalation | ✅ | — |
| Display state | — | ✅ |
| Trigger agent manually | — | ✅ (calls API) |

---

## Hosting split

| Component | Platform | Why |
|-----------|----------|-----|
| API routes + dashboard | **Vercel** | One deploy, serverless, public URL for Twilio webhook |
| PostgreSQL | **Supabase** (default) or **Neon** | Managed Postgres, free tier, REST + realtime |
| WhatsApp | **Twilio Sandbox** | No Meta Business verification for demo |
| AI services | External APIs | Claude, Deepgram — called from Vercel functions |

See [hosting.md](hosting.md) for deploy steps.
