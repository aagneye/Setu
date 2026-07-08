# Setu Troubleshooting

For setup walkthroughs, see [setup-beginner.md](setup-beginner.md), [setup-twilio.md](setup-twilio.md), and [setup-supabase.md](setup-supabase.md).

---

## Login / signup fails

1. Set `AUTH_SECRET` in `.env.local` (any random string)
2. Run migration `supabase/migrations/006_app_users.sql` in Supabase SQL Editor
3. Restart `npm run dev` after changing env vars

## WhatsApp webhook not firing

1. Check Twilio sandbox join — both phones must send `join <code>`
2. Verify webhook URL: `https://<domain>/api/webhook/whatsapp` (POST)
3. Test verify endpoint: `curl https://<domain>/api/webhook/whatsapp/verify`
4. Check Render/Vercel logs for incoming requests
5. For local dev: use ngrok and update Twilio webhook URL

## Vendor not registered

- Vendor `phone` in Supabase must exactly match Twilio `From` field
- Format: `whatsapp:+91XXXXXXXXXX`
- Run: `UPDATE vendors SET phone = 'whatsapp:+91...' WHERE name = '...';`

## Seed fails

```
Missing Supabase env vars
```
→ Copy `.env.example` to `.env.local` and fill keys

## Agent nudge returns 401

→ Set `CRON_SECRET` and `NEXT_PUBLIC_CRON_SECRET` to the same value

## Dashboard empty

→ Run `npm run seed` after schema is applied

## Pipeline events empty

→ Run migration `supabase/migrations/002_pipeline_events.sql`

## Health check fails

```bash
npm run test:health
```

Check which `checks.*` field is `error` in the JSON output.

## Duplicate webhook processing

→ Run migration `005_webhook_idempotency.sql`

## Render cold start (30s+)

→ Free tier spins down. First request after idle is slow. Use health check ping or upgrade plan.

## Claude/Deepgram errors

- Verify API keys in env
- Check API usage limits in provider console
- Voice notes require `DEEPGRAM_API_KEY`
- Photo GRN requires `ANTHROPIC_API_KEY`
