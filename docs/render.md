# Render Deployment Guide

Deploy Setu to [Render](https://render.com) as a Web Service for MVP hosting.

---

## Why Render

- Free tier Web Service for prototyping
- Built-in health checks (`/api/health/ready`)
- `render.yaml` Blueprint for one-click deploy
- Alternative to Vercel with no functional loss for this stack

---

## Option A — Blueprint deploy (recommended)

1. Push repo to GitHub
2. Go to [dashboard.render.com/blueprints](https://dashboard.render.com/blueprints)
3. Connect repo — Render reads `render.yaml` automatically
4. Fill in secret env vars when prompted
5. Deploy

---

## Option B — Manual Web Service

1. **New → Web Service** → connect GitHub repo
2. Settings:
   - **Build command:** `npm install && npm run build`
   - **Start command:** `npm start`
   - **Health check path:** `/api/health/ready`
3. Add all env vars from [environment.md](environment.md)
4. Deploy

---

## Post-deploy checklist

| Step | Action |
|------|--------|
| 1 | Note public URL: `https://setu-xxxx.onrender.com` |
| 2 | Run `supabase/schema.sql` + `supabase/migrations/002_pipeline_events.sql` |
| 3 | `npm run seed` locally (pointing at production Supabase) |
| 4 | Set Twilio webhook: `https://setu-xxxx.onrender.com/api/webhook/whatsapp` |
| 5 | Set Twilio status callback: `https://setu-xxxx.onrender.com/api/webhook/whatsapp/status` |
| 6 | Verify: `curl https://setu-xxxx.onrender.com/api/health` |

---

## Cron on Render

Render free tier does not include cron. Options:

1. **Manual trigger** — use dashboard "Trigger Agent Check" button (recommended for demo)
2. **External cron** — use [cron-job.org](https://cron-job.org) to hit `POST /api/agent/nudge?secret=CRON_SECRET` every 15 min
3. **Vercel Cron** — deploy to Vercel instead for built-in cron via `vercel.json`

---

## Docker deploy

For container-based hosting:

```bash
docker build -t setu .
docker run -p 3000:3000 --env-file .env.local setu
```

Note: enable `output: 'standalone'` in `next.config.mjs` for Docker standalone build.

---

## Health endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /api/health` | Full health check (env, DB, services) |
| `GET /api/health/ready` | Readiness probe for Render load balancer |

---

## Vercel vs Render

| Feature | Vercel | Render |
|---------|--------|--------|
| Next.js support | Native | Web Service |
| Cron | Built-in (`vercel.json`) | External or manual |
| Free tier | Yes | Yes |
| Health checks | Yes | Yes |
| Cold starts | ~1s | ~30s (free tier) |

For hackathon demo: **Vercel is faster**. For MVP prototyping with Docker: **Render works well**.
