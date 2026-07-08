# Supabase Setup — Beginner Guide

Supabase is our **database** (PostgreSQL in the cloud). The dashboard, seed script, and WhatsApp pipeline all read/write here.

**Time:** ~20–30 minutes first time.

---

## Step 1 — Create account and project

1. Go to https://supabase.com/dashboard
2. Sign up (GitHub login is easiest)
3. Click **New project**
4. Fill in:
   - **Name:** `setu` (anything is fine)
   - **Database password:** choose a strong password — **save it somewhere**
   - **Region:** pick closest to you (e.g. Singapore for India)
5. Click **Create new project**
6. Wait 1–2 minutes until status is green

---

## Step 2 — Run SQL files (create tables)

You must run these files **in order** in the Supabase SQL Editor.

1. In your project, click **SQL Editor** (left sidebar)
2. Click **New query**
3. For each file below: open it in your code editor, copy **all** contents, paste into SQL Editor, click **Run**

| Order | File in repo | What it creates |
|-------|--------------|-----------------|
| 1 | `supabase/schema.sql` | Main tables: vendors, POs, updates, GRNs, nudges |
| 2 | `supabase/migrations/002_pipeline_events.sql` | Pipeline audit log |
| 3 | `supabase/migrations/003_alerts.sql` | Dashboard alerts |
| 4 | `supabase/migrations/004_digest_log.sql` | Daily digest history |
| 5 | `supabase/migrations/005_webhook_idempotency.sql` | Prevent duplicate WhatsApp processing |
| 6 | `supabase/migrations/006_app_users.sql` | PM login/signup users |

✅ Each run should say **Success. No rows returned** (or similar).

❌ If you see an error about `uuid-ossp` — run `create extension if not exists "uuid-ossp";` first.

❌ If realtime error on schema — skip those lines or enable replication manually later.

### Verify tables exist

1. Click **Table Editor** (left sidebar)
2. You should see: `vendors`, `purchase_orders`, `po_updates`, `grns`, `nudges`, `app_users`, etc.

---

## Step 3 — Copy API keys to `.env.local`

1. Click **Project Settings** (gear icon, bottom left)
2. Click **API**
3. Copy these into your `.env.local` file:

| Supabase label | `.env.local` variable |
|----------------|----------------------|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` `public` key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` `secret` key | `SUPABASE_SERVICE_ROLE_KEY` |

Example:

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **Never share `service_role` key publicly** — it bypasses all security.

---

## Step 4 — Enable Realtime (for live dashboard)

The dashboard updates without refresh when realtime works.

1. **Database** → **Replication** (or **Publications**)
2. Ensure these tables are in `supabase_realtime` publication:
   - `purchase_orders`
   - `po_updates`
   - `nudges`
   - `alerts` (if you ran migration 003)

The main `schema.sql` tries to add these automatically. If dashboard only updates on manual refresh, check this screen.

---

## Step 5 — Seed demo data

In PowerShell, from project folder:

```powershell
cd C:\Projects\Setu
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

### Check in Supabase

1. **Table Editor** → `purchase_orders` — should have 8 rows
2. **Table Editor** → `vendors` — should have 4 rows

---

## Step 6 — Create PM login (two ways)

### Option A — Via the app (recommended)

1. `npm run dev`
2. Open http://localhost:3000/signup
3. Create account (name, email, password)
4. You are redirected to dashboard

Requires `AUTH_SECRET` in `.env.local` and migration `006_app_users.sql`.

### Option B — Manual SQL (advanced)

Not needed for normal setup — use Option A.

---

## Common Supabase mistakes

| Problem | Fix |
|---------|-----|
| `supabaseUrl is required` | `.env.local` missing or `NEXT_PUBLIC_SUPABASE_URL` empty |
| Seed fails with FK error | Run `schema.sql` before seed; or seed clears and re-inserts |
| Dashboard empty after seed | Wrong Supabase project keys in `.env.local` |
| Login fails after signup | Run migration `006_app_users.sql` |
| Realtime not working | Enable replication for tables (Step 4) |

---

## What each main table stores

| Table | Purpose |
|-------|---------|
| `vendors` | Supplier name + WhatsApp phone |
| `purchase_orders` | POs with status, due date, critical path |
| `po_updates` | Every message and agent action (audit trail) |
| `grns` | Delivery photo verification results |
| `nudges` | Agent WhatsApp reminders |
| `app_users` | PM/engineer login accounts |
| `pipeline_events` | Server pipeline debug log |
| `alerts` | Escalations and warnings on dashboard |

---

## Next steps

- WhatsApp: [setup-twilio.md](setup-twilio.md)
- Full demo: [setup-local-demo.md](setup-local-demo.md)
- Master checklist: [setup-beginner.md](setup-beginner.md)
