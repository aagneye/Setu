# Setu — Project Brief

**Version:** MVP 1.0  
**Event:** Kaya AI India Hackathon 2026 — Track 2 (Supply Chain)  
**Status:** Server-owned pipeline, deployable MVP

---

## 1. What is Setu?

Setu (सेतु — "bridge" in Hindi) is a **WhatsApp-native procurement agent** for Indian construction sites. It bridges the gap between how vendors actually communicate (voice notes in Hindi/Hinglish, photos on WhatsApp) and how site teams need to work (structured PO tracking, delay alerts, delivery verification).

**The product is not a dashboard.** The dashboard is a window. The product is the **server pipeline** that:

1. Receives vendor WhatsApp messages (text, voice, photo)
2. Transcribes, extracts, and structures them into PO updates
3. Verifies delivery photos against purchase orders (GRN)
4. Autonomously nudges non-responsive vendors before delays cascade
5. Escalates to the procurement manager when vendors go silent

No app install for vendors. No ERP integration. No English required.

---

## 2. The problem

Indian construction procurement runs on informal channels:

- Vendors send **Hindi voice notes** on WhatsApp: *"Bhai rebar do din late hoga, transport mein dikkat hai"*
- Site engineers chase updates over **phone calls**, not systems
- Delivery proof is a **photo of a loaded truck**, not a signed GRN in an ERP
- Delays are known to the vendor days before they hit the critical path — but nobody logs it anywhere structured

Every funded competitor (ProcurePro, Krane, Traza, Lumari) assumes **email + ERP + web portal**. Indian vendors don't work that way.

**Setu meets them where they are.**

---

## 3. Use cases

### UC-1 — Vendor delay update (voice note)

| Actor | Vendor (Ramesh, rebar supplier) |
|-------|----------------------------------|
| Trigger | Setu Bot asks for status on PO-1042 (500kg rebar, due tomorrow) |
| Action | Ramesh sends Hindi voice note: delay 2 days, transport issue |
| Pipeline | Twilio webhook → Deepgram transcribe → Claude extract JSON → update PO → reply in Hindi |
| Outcome | PO-1042 status → `delayed`, ETA → +2 days. Dashboard card moves in real time. |

### UC-2 — Delivery verification (photo)

| Actor | Vendor |
|-------|--------|
| Trigger | Material dispatched |
| Action | Sends photo of loaded truck + delivery challan |
| Pipeline | Twilio webhook → Claude Vision → match item/qty vs PO → insert GRN |
| Outcome | If match: status → `delivered`, GRN approved. If mismatch: flagged for PM review. |

### UC-3 — Agent nudge (autonomous)

| Actor | Setu Agent (no human) |
|-------|----------------------|
| Trigger | PO due in 3 days, no vendor update in 24 hours |
| Action | Agent sends friendly Hinglish WhatsApp nudge |
| Escalation | After 2 unanswered nudges → red alert on dashboard for PM |
| Outcome | Delay caught before it hits Level 5 slab pour on critical path |

### UC-4 — PM daily digest

| Actor | Site Engineer (Priya) |
|-------|----------------------|
| Trigger | Cron or manual trigger |
| Action | Agent compiles: "3 items delayed, 1 critical path risk on Level 5 slab pour" |
| Outcome | PM opens dashboard or receives digest without chasing vendors manually |

---

## 4. How it should look

### For the vendor (WhatsApp only)

```
Setu Bot:  Hi Ramesh, PO-1042 (500kg rebar) due July 9. Koi update?

Ramesh:    [voice note — Hindi]

Setu Bot:  Samajh gaya — PO-1042 ETA July 11 update kar diya.
           Site team ko bata dunga.
```

No login. No app. Same WhatsApp they already use.

### For the PM (web dashboard)

```
┌─────────────────────────────────────────────────────────────┐
│  Setu सेतु          Site A — Live Procurement    [Agent ▶]  │
├─────────────────────────────────────────────────────────────┤
│  ⚠ 3 items delayed — 1 critical path risk on Level 5 slab  │
├──────────┬──────────┬──────────┬──────────┬─────────────────┤
│ Ordered  │Confirmed │In Transit│ Delayed  │ Delivered       │
│  PO-1043 │ PO-1042  │ PO-1046  │ PO-1044⚠│ PO-1048         │
│  PO-1047 │ PO-1045  │          │          │                 │
│  PO-1049 │          │          │          │                 │
└──────────┴──────────┴──────────┴──────────┴─────────────────┘
```

- Red border = critical path + overdue
- Orange border = escalated (2 unanswered nudges)
- Click PO → full message thread with transcript + extracted JSON + GRN photos
- "Trigger Agent Check" button for live demo reliability

### For the server (what we own)

```
POST /api/webhook/whatsapp     ← every vendor message enters here
POST /api/agent/nudge          ← autonomous loop runs here
POST /api/agent/digest         ← daily summary generated here
GET  /api/health               ← Render/Vercel health probe
GET  /api/pipeline/events      ← audit log of pipeline runs
```

---

## 5. Architecture principles

| Principle | Implementation |
|-----------|----------------|
| Server owns workflow | All business logic in `lib/pipeline/` and `lib/agent/`, not React components |
| Thin API routes | Routes delegate to pipeline modules — testable, composable |
| Always return 200 to Twilio | Log errors internally; never 500 to Twilio (avoids retry storms) |
| Audit everything | Every pipeline step logged to `pipeline_events` table |
| Deploy anywhere | Next.js on Vercel or Render; Postgres on Supabase or Neon |
| Demo reliability | Manual agent trigger button; seed script for pre-loaded POs |

---

## 6. MVP scope (what we ship)

### In scope

- [x] WhatsApp text → structured PO update
- [x] WhatsApp voice → Deepgram → Claude → PO update
- [x] WhatsApp photo → Claude Vision → GRN
- [x] Agent nudge loop with escalation
- [x] Kanban dashboard with realtime updates
- [x] PO detail with message thread
- [x] Health check endpoints for hosting
- [x] Render + Vercel deploy configs
- [x] Pipeline event audit log
- [x] Vendor CRUD API
- [x] Manual PO status update API
- [x] Daily digest endpoint

### Out of scope (post-hackathon)

- Meta WhatsApp Business API (production)
- Multi-site / multi-tenant auth
- TTS replies in vendor's language
- ERP integrations (SAP, Oracle)
- Payment / invoicing

---

## 7. Hosting plan (MVP)

| Component | Primary | Alternative |
|-----------|---------|-------------|
| API + Dashboard | **Render** (Web Service) | Vercel |
| Database | **Supabase** (Postgres + realtime) | Neon |
| WhatsApp | Twilio Sandbox | Meta Business API |
| Voice | Deepgram API | OpenAI Whisper |
| LLM | Anthropic Claude | — |

Render deploy: `render.yaml` + `Dockerfile` in repo root.  
Health probe: `GET /api/health/ready`

---

## 8. Success criteria for demo

1. **Live URL** loads dashboard with seeded POs
2. **Real WhatsApp round-trip** — voice note moves a PO card in real time
3. **Photo GRN** — delivery photo triggers verification on dashboard
4. **Agent fires live** — "Trigger Agent Check" sends nudge to vendor phone
5. **Escalation visible** — stale PO shows red escalation banner
6. **No 500s on stage** — health endpoint green, pipeline logs clean

---

## 9. Commit strategy

| Phase | Commits | Focus |
|-------|---------|-------|
| 1 — Scaffold | ~10 | Next.js, schema, lib clients |
| 2 — Docs | ~10 | README, setup, architecture, API ref |
| 3 — Server pipeline | ~50 | `lib/pipeline/`, `lib/agent/`, `lib/db/`, API routes, Render deploy |

**Total target: ~70 commits.** Server pipeline is the critical path.

---

## 10. One-sentence pitch

> "Every construction AI tool assumes email and ERPs. India's supply chain runs on WhatsApp and voice notes. Setu is the bridge — an AI agent that turns vendor messages into live procurement intelligence, and chases delays before they become your problem."
