# Build Guide

Commands and workflows for local development and production builds.

---

## Prerequisites

- Node.js 18+ installed
- `.env.local` configured (see [environment.md](environment.md))
- Supabase schema applied (see [setup.md](setup.md))

---

## Development

```bash
npm run dev
```

Starts Next.js dev server at [http://localhost:3000](http://localhost:3000).

- `/` redirects to `/dashboard`
- API routes available at `/api/*`
- Hot reload on file changes

### Local WhatsApp testing

Twilio requires a public HTTPS URL. Use ngrok alongside dev server:

```bash
# Terminal 1
npm run dev

# Terminal 2
npx ngrok http 3000
```

Set Twilio webhook to `https://<ngrok-id>.ngrok.io/api/webhook/whatsapp`.

---

## Production build

```bash
npm run build
```

Runs TypeScript type-checking, ESLint, and Next.js static optimization.

```bash
npm run start
```

Serves the production build locally at port 3000.

### Build output

| Route | Type | Description |
|-------|------|-------------|
| `/` | Static | Redirect to dashboard |
| `/dashboard` | Static | Kanban board |
| `/dashboard/po/[id]` | Dynamic | PO detail page |
| `/api/webhook/whatsapp` | Serverless | Twilio webhook |
| `/api/agent/nudge` | Serverless | Agent cron endpoint |
| `/api/po` | Serverless | PO list/create |
| `/api/po/[id]` | Serverless | PO detail |

---

## Seed demo data

```bash
npm run seed
```

Loads into Supabase:

- 4 vendors (Ramesh, Suresh, Patel, Gupta)
- 8 purchase orders across all Kanban columns
- 1 sample Hindi delay update on PO-1044

**Requires:** `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.

Re-running seed clears existing data and re-inserts fresh demo records.

---

## Lint

```bash
npm run lint
```

Runs ESLint with `next/core-web-vitals` config.

---

## TypeScript

Type checking runs automatically during `npm run build`. To check types without building:

```bash
npx tsc --noEmit
```

---

## Common workflows

### First-time setup

```bash
npm install
cp .env.example .env.local
# fill in .env.local
# run supabase/schema.sql in Supabase SQL editor
npm run seed
npm run dev
```

### After pulling new changes

```bash
npm install
npm run build   # verify no type errors
```

### Before deploying

```bash
npm run lint
npm run build
git push        # Vercel auto-deploys
```

### Reset demo data

```bash
npm run seed
```

### Test agent nudge locally

```bash
curl -X POST "http://localhost:3000/api/agent/nudge?secret=YOUR_CRON_SECRET"
```

---

## Environment-specific behavior

| Command | Loads `.env.local` | Notes |
|---------|-------------------|-------|
| `npm run dev` | ✅ (Next.js auto) | Full pipeline if all keys set |
| `npm run build` | ✅ | Fails at runtime if keys missing in Vercel |
| `npm run seed` | ✅ (manual loader) | See `scripts/seed.ts` |
| `npm run start` | ✅ | Production mode locally |
