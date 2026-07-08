# Setu — WhatsApp-Native Agentic Procurement Tracker

**Setu** ("bridge" in Hindi) is a server-owned procurement pipeline that turns vendor WhatsApp messages — voice notes, text, and delivery photos — into structured purchase-order updates. The dashboard is a live window into that pipeline; the product is the workflow running on the server.

Built for the **Kaya AI India Hackathon 2026** (Track 2: Supply Chain).

---

## What we own

| Layer | What it does | Where it lives |
|-------|--------------|----------------|
| **WhatsApp webhook** | Ingest vendor messages, transcribe voice, extract structured PO updates | `POST /api/webhook/whatsapp` |
| **Vision / GRN** | Verify delivery photos against POs via Claude Vision | Same webhook, photo branch |
| **Agent loop** | Auto-nudge stale vendors, escalate after 2 unanswered nudges | `POST /api/agent/nudge` (Vercel Cron) |
| **PO API** | Read/write purchase orders for dashboard and integrations | `GET/POST /api/po` |
| **Dashboard** | Kanban board + PO detail (read-only view of pipeline state) | `/dashboard` |

---

## Tech stack

| Layer | Choice | Hosting |
|-------|--------|---------|
| API + frontend | Next.js 14 (App Router, TypeScript) | [Vercel](https://vercel.com) |
| Database | PostgreSQL via Supabase (Neon also works) | [Supabase](https://supabase.com) or [Neon](https://neon.tech) |
| WhatsApp | Twilio Sandbox | Twilio |
| Voice transcription | Deepgram | Deepgram API |
| LLM (extraction + vision) | Anthropic Claude | Anthropic API |

---

## Quick start

```bash
git clone <repo-url>
cd Setu
npm install
cp .env.example .env.local   # fill in keys — see docs/environment.md
# Run supabase/schema.sql in your Supabase SQL editor
npm run seed
npm run dev
```

Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard).

Full setup: **[docs/setup.md](docs/setup.md)**

---

## Required API keys

Copy `.env.example` → `.env.local` and fill in:

| Variable | Service | Get it from |
|----------|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase | Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | Project Settings → API (server only) |
| `ANTHROPIC_API_KEY` | Claude | [console.anthropic.com](https://console.anthropic.com) |
| `DEEPGRAM_API_KEY` | Deepgram | [console.deepgram.com](https://console.deepgram.com) |
| `TWILIO_ACCOUNT_SID` | Twilio | Twilio Console |
| `TWILIO_AUTH_TOKEN` | Twilio | Twilio Console |
| `TWILIO_WHATSAPP_NUMBER` | Twilio | Sandbox default: `whatsapp:+14155238886` |
| `CRON_SECRET` | Self | Any random string (protects agent endpoint) |
| `NEXT_PUBLIC_CRON_SECRET` | Self | Same value (dashboard trigger button) |

Details: **[docs/environment.md](docs/environment.md)**

---

## Documentation

| Doc | Description |
|-----|-------------|
| [docs/setup.md](docs/setup.md) | End-to-end setup from zero |
| [docs/architecture.md](docs/architecture.md) | Server workflow and pipeline design |
| [docs/api.md](docs/api.md) | API route reference |
| [docs/hosting.md](docs/hosting.md) | Deploy to Vercel + Supabase |
| [docs/build.md](docs/build.md) | Dev, build, seed, and lint commands |
| [docs/folder-structure.md](docs/folder-structure.md) | Repo layout explained |
| [docs/database.md](docs/database.md) | Schema, Supabase vs Neon |
| [docs/contributing.md](docs/contributing.md) | How to contribute |
| [SPEC.md](SPEC.md) | Original hackathon build spec |

---

## Scripts

```bash
npm run dev      # local dev server (port 3000)
npm run build    # production build
npm run start    # run production build locally
npm run seed     # load demo vendors + POs into Supabase
npm run lint     # ESLint
```

---

## License

Private — Kaya AI India Hackathon 2026 submission.
