# Environment Variables

All secrets go in `.env.local` (local dev) and Vercel project settings (production). Never commit `.env.local`.

Copy the template:

```bash
cp .env.example .env.local
```

---

## Full reference

| Variable | Required for | Description | Where to get it |
|----------|-------------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Dashboard, seed, API | Supabase project URL | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Dashboard (client) | Public anon key — safe to expose in browser | Supabase → Settings → API → `anon` `public` |
| `SUPABASE_SERVICE_ROLE_KEY` | API routes, seed | Service role key — **server only, never expose** | Supabase → Settings → API → `service_role` `secret` |
| `ANTHROPIC_API_KEY` | Webhook, agent | Claude API for extraction, vision, nudge messages | [console.anthropic.com](https://console.anthropic.com) → API Keys |
| `DEEPGRAM_API_KEY` | Webhook (voice) | Deepgram for Hindi/Hinglish voice transcription | [console.deepgram.com](https://console.deepgram.com) → API Keys |
| `TWILIO_ACCOUNT_SID` | Webhook, agent | Twilio account identifier | Twilio Console → Account Info |
| `TWILIO_AUTH_TOKEN` | Webhook, agent | Twilio auth token — **server only** | Twilio Console → Account Info |
| `TWILIO_WHATSAPP_NUMBER` | Webhook, agent | Twilio sandbox WhatsApp sender | Default: `whatsapp:+14155238886` |
| `CRON_SECRET` | Agent nudge API | Random string protecting `/api/agent/nudge` | Generate any random string |
| `NEXT_PUBLIC_CRON_SECRET` | Dashboard button | Same value as `CRON_SECRET` — used by client trigger button | Same as above |

---

## Prefixes explained

| Prefix | Meaning |
|--------|---------|
| `NEXT_PUBLIC_` | Exposed to the browser — only use for non-secret values |
| No prefix | Server-only — only available in API routes and server components |

**Never prefix secrets with `NEXT_PUBLIC_`.** `SUPABASE_SERVICE_ROLE_KEY`, `TWILIO_AUTH_TOKEN`, and `ANTHROPIC_API_KEY` must not have the public prefix.

---

## Minimal configs

### Dashboard + seed only (no WhatsApp)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

### Full pipeline (WhatsApp + agent)

Add to the above:

```env
ANTHROPIC_API_KEY=sk-ant-api03-...
DEEPGRAM_API_KEY=...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
CRON_SECRET=my-secret-string
NEXT_PUBLIC_CRON_SECRET=my-secret-string
```

---

## Vercel deployment

Add all variables in **Vercel → Project → Settings → Environment Variables**.

Apply to: Production, Preview, and Development.

After adding or changing env vars, redeploy for changes to take effect.

---

## Local dev notes

- Next.js auto-loads `.env.local` for `npm run dev` and `npm run build`
- The seed script (`npm run seed`) manually loads `.env.local` — see `scripts/seed.ts`
- `.env.local` is gitignored — each developer maintains their own copy
