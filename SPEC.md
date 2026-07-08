# Setu — WhatsApp-Native Agentic Procurement Tracker

> Full build spec for Kaya AI India Hackathon 2026 (Track 2: Supply Chain)

## One-Liner

Setu ("bridge" in Hindi) is a WhatsApp-native AI agent that turns vendor voice notes and delivery photos into a live, structured procurement dashboard — no app to install, no ERP to integrate, no English required.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend + API | Next.js 14 (App Router, TypeScript) |
| Hosting | Vercel |
| Database | Supabase (Postgres) |
| File storage | Supabase Storage |
| WhatsApp | Twilio WhatsApp Sandbox |
| Voice | Deepgram |
| LLM | Anthropic Claude API |
| Styling | Tailwind CSS + shadcn/ui |
| Cron/agent | Vercel Cron |

## Folder Structure

```
setu/
├── app/
│   ├── page.tsx                      # redirect to /dashboard
│   ├── dashboard/
│   │   ├── page.tsx                  # main Kanban board
│   │   └── po/[id]/page.tsx          # PO detail
│   ├── api/
│   │   ├── webhook/whatsapp/route.ts
│   │   ├── agent/nudge/route.ts
│   │   └── po/route.ts + po/[id]/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── KanbanBoard.tsx
│   ├── POCard.tsx
│   ├── POThread.tsx
│   ├── AlertBanner.tsx
│   └── ui/
├── lib/
│   ├── supabase.ts
│   ├── claude.ts
│   ├── deepgram.ts
│   ├── twilio.ts
│   └── types.ts
├── scripts/seed.ts
├── supabase/schema.sql
└── vercel.json
```

## Environment Variables

See `.env.example` for required keys.

## Build Order

1. Next.js scaffold + Vercel deploy
2. Supabase schema
3. Twilio sandbox webhook
4. Claude extraction prompts
5. Deepgram voice transcription
6. Full webhook pipeline
7. Photo/GRN vision path
8. Dashboard Kanban + realtime
9. PO detail page
10. Agent nudge cron + seed script

## Demo Script (2 min)

1. Problem statement — delays vendors already know about
2. WhatsApp voice note → dashboard updates live
3. Delivery photo → GRN verification
4. Trigger agent check → nudge + escalation
5. Close on differentiation vs email/ERP tools

See full spec in hackathon submission docs for prompts, schema DDL, and pitch framing.
