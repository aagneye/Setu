# Database Guide

Setu uses PostgreSQL. The default setup is **Supabase**; **Neon** is a supported alternative.

---

## Schema overview

Run `supabase/schema.sql` once in your database SQL editor. It creates:

| Table | Purpose |
|-------|---------|
| `vendors` | Supplier registry — phone number is WhatsApp lookup key |
| `purchase_orders` | POs with status, ETA, critical-path flag |
| `po_updates` | Audit trail — every vendor message and agent nudge |
| `grns` | Goods Received Notes from photo verification |
| `nudges` | Agent nudge tracking — count, response, escalation |

### Status values

`purchase_orders.status` enum:

```
ordered → confirmed → in_transit → delayed → delivered
```

### Key relationships

```
vendors
  └── purchase_orders (vendor_id)
        ├── po_updates (po_id)
        ├── grns (po_id)
        └── nudges (po_id)
```

---

## Supabase (recommended)

### Setup

1. Create project at [supabase.com](https://supabase.com)
2. SQL Editor → paste `supabase/schema.sql` → Run
3. Verify tables in **Table Editor**

### Realtime

The schema enables realtime on `purchase_orders`, `po_updates`, and `nudges`:

```sql
alter publication supabase_realtime add table purchase_orders;
alter publication supabase_realtime add table po_updates;
alter publication supabase_realtime add table nudges;
```

This powers live dashboard updates without page refresh.

### Client usage

```typescript
// Browser (dashboard) — anon key
import { getSupabaseClient } from "@/lib/supabase";

// API routes (server) — service role key
import { getSupabaseAdmin } from "@/lib/supabase";
```

Service role bypasses RLS — only use in API routes, never expose to browser.

---

## Neon (alternative)

Neon is serverless Postgres. It works for the API layer but does not include Supabase's realtime or REST API.

### Setup

1. Create project at [neon.tech](https://neon.tech)
2. Open SQL Editor → run `supabase/schema.sql`
3. Copy connection string

### Required code changes to use Neon

| File | Change |
|------|--------|
| `lib/supabase.ts` | Replace with `@neondatabase/serverless` client |
| `app/dashboard/page.tsx` | Replace realtime subscription with polling |
| `.env.local` | Use `DATABASE_URL` instead of Supabase keys |

### When to use Neon

- You already have a Neon account
- You don't need live dashboard updates (polling is fine)
- You want to use Drizzle ORM or raw SQL

For the hackathon demo, **stick with Supabase** — realtime Kanban updates are a key wow moment.

---

## Indexes

The schema creates indexes on:

- `purchase_orders(status)` — Kanban grouping
- `purchase_orders(due_date)` — agent nudge window query
- `po_updates(po_id)` — thread loading

---

## Seeding

```bash
npm run seed
```

Inserts 4 vendors and 8 POs. See `scripts/seed.ts` for the full dataset.

To customize vendor phone numbers for your Twilio sandbox, edit `VENDORS` in `scripts/seed.ts` before seeding.

---

## Useful SQL queries

### Check all PO statuses

```sql
SELECT po_number, status, due_date, current_eta, is_critical_path
FROM purchase_orders
ORDER BY due_date;
```

### View message thread for a PO

```sql
SELECT source, raw_message, new_status, created_at
FROM po_updates
WHERE po_id = (SELECT id FROM purchase_orders WHERE po_number = 'PO-1042')
ORDER BY created_at;
```

### Find escalated POs

```sql
SELECT po.po_number, n.nudge_number, n.escalated_to_pm
FROM nudges n
JOIN purchase_orders po ON po.id = n.po_id
WHERE n.escalated_to_pm = true;
```

### Update vendor phone for Twilio sandbox

```sql
UPDATE vendors
SET phone = 'whatsapp:+91XXXXXXXXXX'
WHERE name = 'Ramesh Rebar Supplies';
```

---

## Migrations

For hackathon/demo: edit `supabase/schema.sql` and re-run in SQL editor.

For production: use Supabase Migrations (`supabase db diff`) or a tool like Drizzle Kit.
