# Contributing

Thank you for contributing to Setu. This guide covers how to get started, our conventions, and what to work on.

---

## Getting started

1. Fork / clone the repo
2. Follow [setup.md](setup.md) to configure your local environment
3. Create a branch for your work:

   ```bash
   git checkout -b feat/short-description
   ```

4. Make changes, verify build passes:

   ```bash
   npm run lint
   npm run build
   ```

5. Commit and open a pull request

---

## Commit conventions

We use **atomic commits** — one logical change per commit, one file when possible.

### Format

```
<type>(<file>): <short description>
```

### Types

| Type | When |
|------|------|
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `refactor` | Code change with no behavior change |
| `docs` | Documentation only |
| `chore` | Config, deps, tooling |
| `style` | Formatting, no logic change |

### Examples

```
feat(app/api/webhook/whatsapp/route.ts): handle photo-only messages
fix(scripts/seed.ts): load env vars from .env.local
docs(docs/api.md): document agent nudge auth
chore(package.json): add dotenv dev dependency
```

### Rules

- One file per commit whenever possible
- Same file changed twice for different reasons = two commits
- Never bundle unrelated changes
- Reference GitLab issues with `#<number>` in commit messages and MR descriptions

---

## What to work on

Priority order for contributions:

### 1. Server workflow (highest impact)

The API routes in `app/api/` are the product. Improvements here matter most:

- Better Hindi/Hinglish extraction accuracy
- GRN vision verification edge cases
- Agent nudge timing and escalation logic
- Error handling and retry for Twilio/Deepgram failures

### 2. AI prompts

Prompts live in `lib/claude.ts`. Test changes against real WhatsApp messages before committing.

### 3. Dashboard

The dashboard is a read-only view. Keep it simple:

- Loading and empty states
- Mobile layout for demo recording
- PO detail thread formatting

### 4. Documentation

Docs in `docs/` — keep setup steps current as services change.

### 5. Database

Schema changes go in `supabase/schema.sql`. Document any new tables or columns in `docs/database.md`.

---

## Code conventions

### TypeScript

- Strict mode enabled — no `any` unless unavoidable
- Shared types in `lib/types.ts` — keep in sync with DB schema
- API routes return `NextResponse.json()` or `new NextResponse()`

### API routes

- All business logic in API routes or `lib/` — not in React components
- Use `getSupabaseAdmin()` in API routes (service role)
- Use `getSupabaseClient()` in client components (anon key)
- Return `200` to Twilio even on internal errors (log instead of 500 to avoid retries)

### Components

- Dashboard components are `"use client"` — they subscribe to Supabase realtime
- No business logic in components — call API routes for writes
- Use shadcn/ui primitives from `components/ui/`

### Environment variables

- Never commit `.env.local`
- Never prefix secrets with `NEXT_PUBLIC_`
- Add new vars to `.env.example` and `docs/environment.md`

---

## Testing changes

### WhatsApp pipeline

```bash
npm run dev
npx ngrok http 3000
# point Twilio webhook to ngrok URL
# send test message from sandbox-connected phone
```

### Agent nudge

```bash
curl -X POST "http://localhost:3000/api/agent/nudge?secret=YOUR_CRON_SECRET"
```

### Dashboard

```bash
npm run seed
npm run dev
# open http://localhost:3000/dashboard
```

### Build check (required before PR)

```bash
npm run lint && npm run build
```

---

## Pull request checklist

- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Atomic commits with correct message format
- [ ] New env vars added to `.env.example` and `docs/environment.md`
- [ ] API changes documented in `docs/api.md`
- [ ] Schema changes documented in `docs/database.md`
- [ ] No secrets committed

---

## Questions

Open a GitLab issue or reach out to the team. For hackathon-specific decisions, refer to [SPEC.md](../SPEC.md).
