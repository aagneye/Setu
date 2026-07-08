# Setup Guide

End-to-end setup from a fresh clone to a live WhatsApp round-trip.

**Time estimate:** ~90 minutes for first-time setup.

---

## Prerequisites

- Node.js 18+ (22 recommended)
- npm
- Accounts (all have free tiers):
  - [Supabase](https://supabase.com) — database
  - [Vercel](https://vercel.com) — hosting
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

1. Create a new project at [supabase.com/dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor** → paste contents of `supabase/schema.sql` → **Run**
3. Go to **Project Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY`

> **Neon alternative:** Create a Postgres database at [neon.tech](https://neon.tech), run `supabase/schema.sql` via the Neon SQL editor, and use the connection string. You will need to replace `@supabase/supabase-js` calls with a direct Postgres client (`@neondatabase/serverless` + Drizzle or raw SQL). See [database.md](database.md).

---

## Step 3 — Environment variables

```bash
cp .env.example .env.local
```

Fill in all values. See [environment.md](environment.md) for details on each key.

### Optional for custom auth

If you use the built-in login/signup pages in this repo:

```bash
AUTH_SECRET=replace-with-random-secret
```

Google OAuth can be added later by you (recommended approach: Supabase Auth or NextAuth). The current UI already includes a Google auth placeholder in `/login` and `/signup`.

Minimum required to run seed + dashboard:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Minimum required for full WhatsApp pipeline:

```
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

Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) — you should see the Kanban board populated.

---

## Step 5 — Twilio WhatsApp sandbox

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

# Terminal 2
npx ngrok http 3000
```

Copy the ngrok HTTPS URL (e.g. `https://abc123.ngrok.io`).

In Twilio sandbox settings:

- **When a message comes in:** `https://abc123.ngrok.io/api/webhook/whatsapp` (POST)

Send a WhatsApp message from your vendor phone. You should get a bot reply and see the dashboard update.

---

## Step 7 — Deploy to Vercel

See [hosting.md](hosting.md) for full deploy steps.

Quick version:

1. Push repo to GitHub
2. Import project in [vercel.com/new](https://vercel.com/new)
3. Add all env vars from `.env.local` in Vercel project settings
4. Deploy — note your public URL (e.g. `https://setu.vercel.app`)
5. Update Twilio webhook to: `https://setu.vercel.app/api/webhook/whatsapp`

---

## Step 8 — Verify end-to-end

| Test | How | Expected |
|------|-----|----------|
| Dashboard loads | Open `/dashboard` | Kanban with 8 POs |
| Text update | WhatsApp text to sandbox | PO status updates, bot replies |
| Voice note | Send Hindi voice note | Transcribed, PO updated |
| Delivery photo | Send photo of goods | GRN row created, status → delivered |
| Agent nudge | Click "Trigger Agent Check" | Nudge sent to stale vendor PO |
| PM login | Open `/login` and sign in | Dashboard opens with overview + history |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `supabaseUrl is required` on seed | `.env.local` missing or empty — copy from `.env.example` |
| Vendor not registered | Update vendor phone in Supabase to match Twilio `From` number exactly |
| Webhook 500 | Check Vercel function logs; verify all API keys in env |
| Dashboard empty | Run `npm run seed`; check Supabase connection |
| Agent nudge 401 | Set `CRON_SECRET` and `NEXT_PUBLIC_CRON_SECRET` to same value |
| Realtime not updating | Enable realtime on tables in Supabase → Database → Replication |
