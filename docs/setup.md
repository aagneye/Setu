# Setup Guide

End-to-end setup from a fresh clone to a live WhatsApp round-trip.

**Time estimate:** ~90 minutes for first-time setup.

> **New to development?** Start with **[setup-beginner.md](setup-beginner.md)** — step-by-step for juniors with no prior experience.

---

## Setup guides index

| Guide | Who it's for |
|-------|--------------|
| **[setup-beginner.md](setup-beginner.md)** | Complete beginners — start here |
| **[setup-supabase.md](setup-supabase.md)** | Database from zero (all migrations) |
| **[setup-twilio.md](setup-twilio.md)** | WhatsApp sandbox + webhook (detailed) |
| **[setup-local-demo.md](setup-local-demo.md)** | Rehearse full demo before presenting |
| [environment.md](environment.md) | Every env var explained |
| [hosting.md](hosting.md) | Deploy to Vercel |
| [render.md](render.md) | Deploy to Render |
| [troubleshooting.md](troubleshooting.md) | When something breaks |

---

## Prerequisites

- Node.js 18+ (22 recommended)
- npm
- Accounts (all have free tiers):
  - [Supabase](https://supabase.com) — database
  - [Vercel](https://vercel.com) or [Render](https://render.com) — hosting
  - [Twilio](https://twilio.com) — WhatsApp sandbox
  - [Anthropic](https://console.anthropic.com) — Claude API
  - [Deepgram](https://console.deepgram.com) — voice transcription

---

## Step 1 — Clone and install

```bash
git clone <repo-url>
cd Setu
npm install
```

---

## Step 2 — Database (Supabase)

👉 **Detailed guide:** [setup-supabase.md](setup-supabase.md)

1. Create a new project at [supabase.com/dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor** and run these files **in order**:
   - `supabase/schema.sql`
   - `supabase/migrations/002_pipeline_events.sql`
   - `supabase/migrations/003_alerts.sql`
   - `supabase/migrations/004_digest_log.sql`
   - `supabase/migrations/005_webhook_idempotency.sql`
   - `supabase/migrations/006_app_users.sql`
3. Go to **Project Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY`

> **Neon alternative:** Create a Postgres database at [neon.tech](https://neon.tech), run all SQL files via the Neon SQL editor. See [database.md](database.md).

---

## Step 3 — Environment variables

```bash
cp .env.example .env.local
```

Fill in all values. See [environment.md](environment.md) for details on each key.

### Auth (PM login/signup)

```bash
AUTH_SECRET=replace-with-random-secret
```

Google OAuth can be added later (Supabase Auth or NextAuth). The UI includes a Google placeholder on `/login` and `/signup`.

Minimum required to run seed + dashboard:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
AUTH_SECRET=any-random-secret-string
```

Minimum required for full WhatsApp pipeline:

```env
ANTHROPIC_API_KEY=sk-ant-...
DEEPGRAM_API_KEY=...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
CRON_SECRET=any-random-string
NEXT_PUBLIC_CRON_SECRET=any-random-string
```

---

## Step 4 — Seed demo data

```bash
npm run seed
```

Expected output:

```
🌱 Seeding Setu demo data...
✓ 4 vendors created
✓ 8 purchase orders created
✓ Sample vendor update seeded for PO-1044
✅ Seed complete!
```

Open [http://localhost:3000/login](http://localhost:3000/login) — sign up, then open `/dashboard` to see the Kanban board.

---

## Step 5 — Twilio WhatsApp sandbox

👉 **Detailed guide:** [setup-twilio.md](setup-twilio.md)

1. Sign up at [twilio.com](https://twilio.com)
2. Go to **Messaging → Try it out → Send a WhatsApp message**
3. Note the sandbox number (default: `+1 415 523 8886`) and join code (e.g. `join happy-tiger`)
4. From your phone, send the join code to the sandbox number on WhatsApp
5. Do the same from a second phone (vendor role for demo)

### Update vendor phone numbers

The seed script uses placeholder numbers. Update them in Supabase to match your sandbox-connected phones:

```sql
UPDATE vendors SET phone = 'whatsapp:+91XXXXXXXXXX' WHERE name = 'Ramesh Rebar Supplies';
```

Or edit `scripts/seed.ts` before running seed.

---

## Step 6 — Local webhook testing (ngrok)

Twilio needs a public URL. For local dev:

```bash
# Terminal 1
npm run dev

# Terminal 2 (use the port shown by dev — 3000, 3001, or 3002)
npx ngrok http 3000
```

Copy the ngrok HTTPS URL (e.g. `https://abc123.ngrok-free.app`).

In Twilio sandbox settings:

- **When a message comes in:** `https://abc123.ngrok-free.app/api/webhook/whatsapp` (POST)

Send a WhatsApp message from your vendor phone. You should get a bot reply and see the dashboard update.

Verify locally:

```bash
npm run check:webhook
```

---

## Step 7 — Deploy to production

See [hosting.md](hosting.md) (Vercel) or [render.md](render.md) (Render).

Quick version (Vercel):

1. Push repo to GitHub
2. Import project in [vercel.com/new](https://vercel.com/new)
3. Add all env vars from `.env.local` in Vercel project settings
4. Deploy — note your public URL (e.g. `https://setu.vercel.app`)
5. Update Twilio webhook to: `https://setu.vercel.app/api/webhook/whatsapp`

---

## Step 8 — Verify end-to-end

| Test | How | Expected |
|------|-----|----------|
| Dashboard loads | Sign up at `/signup`, open `/dashboard` | Kanban with 8 POs |
| Text update | WhatsApp text to sandbox | PO status updates, bot replies |
| Voice note | Send Hindi voice note | Transcribed, PO updated |
| Delivery photo | Send photo of goods | GRN row created, status → delivered |
| Agent nudge | Click "Trigger Agent Check" | Nudge sent to stale vendor PO |
| PM login | Open `/login` and sign in | Dashboard opens with overview + history |

👉 **Demo rehearsal:** [setup-local-demo.md](setup-local-demo.md)

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `supabaseUrl is required` on seed | `.env.local` missing or empty — copy from `.env.example` |
| Vendor not registered | Update vendor phone in Supabase to match Twilio `From` number exactly |
| Webhook 500 | Check Vercel/Render function logs; verify all API keys in env |
| Dashboard empty | Run `npm run seed`; check Supabase connection |
| Agent nudge 401 | Set `CRON_SECRET` and `NEXT_PUBLIC_CRON_SECRET` to same value |
| Login fails | Set `AUTH_SECRET`; run migration `006_app_users.sql` |
| Realtime not updating | Enable realtime on tables in Supabase → Database → Replication |

Full list: [troubleshooting.md](troubleshooting.md)
