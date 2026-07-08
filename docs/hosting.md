# Hosting Guide

Setu uses a split hosting model: **Vercel** for the server (API + dashboard) and **Supabase** for the database.

---

## Architecture on production

```
Internet
  │
  ├─ Vendor WhatsApp ──▶ Twilio ──▶ Vercel /api/webhook/whatsapp
  │
  ├─ PM browser ──────▶ Vercel /dashboard
  │
  └─ Vercel Cron ─────▶ Vercel /api/agent/nudge
                              │
                              ▼
                        Supabase PostgreSQL
```

---

## Vercel (API + dashboard)

### Why Vercel

- One deploy for API routes and dashboard
- Instant public HTTPS URL (required for Twilio webhook)
- Built-in cron support (`vercel.json`)
- Free tier sufficient for hackathon demo

### Deploy steps

1. **Push to GitHub**

   ```bash
   git remote add origin https://github.com/<org>/setu.git
   git push -u origin master
   ```

2. **Import in Vercel**

   - Go to [vercel.com/new](https://vercel.com/new)
   - Import the GitHub repo
   - Framework preset: **Next.js** (auto-detected)
   - No build command changes needed

3. **Add environment variables**

   In Vercel → Project → Settings → Environment Variables, add every key from [environment.md](environment.md).

4. **Deploy**

   Vercel deploys automatically on push. Note your URL: `https://setu-<hash>.vercel.app`

5. **Verify cron**

   `vercel.json` configures the agent to run every 15 minutes:

   ```json
   {
     "crons": [{ "path": "/api/agent/nudge", "schedule": "*/15 * * * *" }
   }
   ```

   Vercel Cron requires a Pro plan on production. For hackathon demos, use the dashboard **Trigger Agent Check** button instead.

6. **Point Twilio webhook**

   Twilio Console → WhatsApp Sandbox → **When a message comes in:**

   ```
   https://setu-<hash>.vercel.app/api/webhook/whatsapp
   ```

   Method: **POST**

---

## Supabase (database)

### Why Supabase

- Managed PostgreSQL with free tier
- Built-in REST API and realtime subscriptions (powers live dashboard)
- SQL editor for running `supabase/schema.sql`
- No connection pooling setup needed for serverless

### Setup steps

1. Create project at [supabase.com/dashboard](https://supabase.com/dashboard)
2. Run `supabase/schema.sql` in SQL Editor
3. Enable realtime (schema already includes `alter publication supabase_realtime add table ...`)
4. Copy API keys to Vercel env vars

### Row Level Security

For the hackathon demo, RLS is not enabled. For production, add policies restricting `purchase_orders` reads to authenticated site managers.

---

## Neon (database alternative)

[Neon](https://neon.tech) is a serverless Postgres alternative if you prefer it over Supabase.

### Differences when using Neon

| Feature | Supabase | Neon |
|---------|----------|------|
| Realtime subscriptions | Built-in | Not included — use polling or Pusher |
| REST API | Auto-generated | Not included — use direct SQL |
| Auth | Built-in | Not included |
| Setup | Run schema.sql in SQL editor | Run schema.sql in Neon SQL editor |

To switch to Neon:

1. Create a Neon project and run `supabase/schema.sql`
2. Install `@neondatabase/serverless`
3. Replace `lib/supabase.ts` with a Neon client
4. Replace dashboard realtime subscriptions with polling (add a refresh interval)

For the hackathon demo, **Supabase is recommended** — realtime dashboard updates are a key demo moment.

---

## Twilio (WhatsApp)

- **Sandbox** (demo): No Meta Business verification needed. Limited to pre-joined numbers.
- **Production**: Apply for WhatsApp Business API via Twilio or Meta directly.

Sandbox join flow:

1. Send `join <code>` to `+1 415 523 8886` from each test phone
2. Both PM phone and vendor phone must join before demo

---

## External AI APIs

| Service | Called from | Notes |
|---------|-------------|-------|
| Anthropic Claude | Vercel function | `claude-sonnet-4-20250514` for extraction + vision |
| Deepgram | Vercel function | `nova-2` model, Hindi + code-switching |

Both are pay-per-use. Set usage limits in their consoles before demo day.

---

## Custom domain (optional)

In Vercel → Project → Settings → Domains, add your domain. Update the Twilio webhook URL accordingly.

---

## Monitoring

| What | Where |
|------|-------|
| API route errors | Vercel → Project → Logs |
| Function invocations | Vercel → Project → Analytics |
| Database queries | Supabase → Logs |
| WhatsApp delivery | Twilio Console → Messaging → Logs |
