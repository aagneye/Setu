# Folder Structure

```
Setu/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # / → redirects to /dashboard
│   ├── layout.tsx                # Root layout, metadata, fonts
│   ├── globals.css               # Tailwind + shadcn CSS variables
│   │
│   ├── api/                      # ★ SERVER-OWNED WORKFLOW (core product)
│   │   ├── webhook/
│   │   │   └── whatsapp/
│   │   │       └── route.ts      # Twilio inbound: voice/text/photo pipeline
│   │   ├── agent/
│   │   │   └── nudge/
│   │   │       └── route.ts      # Agentic nudge + escalation loop
│   │   └── po/
│   │       ├── route.ts          # GET list / POST create POs
│   │       └── [id]/
│   │           └── route.ts      # GET single PO with thread + GRNs
│   │
│   └── dashboard/                # Read-only UI (window into pipeline)
│       ├── page.tsx              # Kanban board + agent trigger + alerts
│       └── po/
│           └── [id]/
│               └── page.tsx      # PO detail: thread, GRN, metadata
│
├── components/                   # React UI components
│   ├── KanbanBoard.tsx           # Status-column board
│   ├── POCard.tsx                # Single PO card in Kanban
│   ├── POThread.tsx              # Message audit trail
│   ├── AlertBanner.tsx           # Critical-path + escalation alerts
│   └── ui/                       # shadcn/ui primitives
│       ├── button.tsx
│       ├── card.tsx
│       └── badge.tsx
│
├── lib/                          # Shared server + client utilities
│   ├── types.ts                  # TypeScript types matching DB schema
│   ├── supabase.ts               # Supabase client (anon + service role)
│   ├── claude.ts                 # Claude prompts: extract, vision, nudge
│   ├── deepgram.ts               # Voice transcription + media download
│   ├── twilio.ts                 # WhatsApp send + webhook parser
│   └── utils.ts                  # cn(), date helpers, overdue checks
│
├── scripts/
│   └── seed.ts                   # Demo data loader (vendors + 8 POs)
│
├── supabase/
│   └── schema.sql                # Full Postgres DDL — run once in Supabase
│
├── docs/                         # Project documentation
│   ├── setup.md                  # End-to-end setup guide
│   ├── architecture.md           # Server workflow design
│   ├── api.md                    # API route reference
│   ├── hosting.md                # Vercel + Supabase deploy
│   ├── build.md                  # Dev/build/seed commands
│   ├── environment.md            # Env var reference
│   ├── database.md               # Schema + Supabase vs Neon
│   ├── folder-structure.md       # This file
│   └── contributing.md           # Contribution guide
│
├── .env.example                  # Env var template (copy to .env.local)
├── .gitignore
├── components.json               # shadcn/ui config
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json                   # Vercel cron config (agent every 15 min)
├── SPEC.md                       # Original hackathon build spec
└── README.md                     # Project overview + doc index
```

---

## What matters most

The `app/api/` directory is the product. Everything else supports it.

| Directory | Role | Priority |
|-----------|------|----------|
| `app/api/` | Server workflow — ingestion, agent, PO CRUD | ★★★ Core |
| `lib/` | AI + messaging + DB clients used by API routes | ★★★ Core |
| `supabase/` | Database schema | ★★ Required |
| `scripts/` | Demo data for reliable live demo | ★★ Required |
| `app/dashboard/` | Live view of pipeline state | ★ Demo |
| `components/` | Dashboard UI | ★ Demo |
| `docs/` | Setup and contribution docs | ★ Onboarding |

---

## API route → lib mapping

| Route | Uses |
|-------|------|
| `webhook/whatsapp` | `lib/twilio`, `lib/deepgram`, `lib/claude`, `lib/supabase` |
| `agent/nudge` | `lib/claude`, `lib/twilio`, `lib/supabase`, `lib/utils` |
| `po` | `lib/supabase` |
| `po/[id]` | `lib/supabase` |

---

## Config files

| File | Purpose |
|------|---------|
| `vercel.json` | Cron schedule for agent nudge (every 15 min) |
| `components.json` | shadcn/ui paths and style config |
| `.env.example` | Template for all required secrets |
| `tsconfig.json` | TypeScript strict mode, `@/*` path alias |
