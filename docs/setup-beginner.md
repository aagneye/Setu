# Setu Setup — Beginner Guide (Start Here)

This guide is for someone setting up Setu for the **first time** with no prior experience.

Read the sections **in order**. Do not skip ahead until each step shows ✅.

**Total time:** about 2–3 hours first time (less if someone helps with accounts).

---

## What you are setting up

Setu has two sides:

| Who | What they use | You set up |
|-----|---------------|------------|
| **Vendor** (supplier) | WhatsApp only — text, voice, photos | Twilio sandbox |
| **PM / Engineer** | Web dashboard — login, Kanban, history | Supabase + this app |

Vendors **never** install an app. They message a WhatsApp number.  
PMs open the website and log in.

---

## Before you start — install these

### 1. Node.js

- Download: https://nodejs.org (pick **LTS**, version 18 or higher)
- After install, open **PowerShell** and check:

```powershell
node -v
npm -v
```

You should see version numbers (e.g. `v22.x.x`). If not, restart your terminal.

### 2. Git

- Download: https://git-scm.com/download/win
- Check:

```powershell
git -v
```

### 3. A code editor

- [VS Code](https://code.visualstudio.com/) or [Cursor](https://cursor.com/) — either is fine.

### 4. Two phones (for WhatsApp demo)

- **Phone A** — pretend to be the vendor (Ramesh)
- **Phone B** — optional, second vendor or your own test
- **Laptop** — PM dashboard

---

## Setup order (follow this exactly)

| Step | Guide | What you get |
|------|-------|--------------|
| 1 | [setup-supabase.md](setup-supabase.md) | Database + API keys |
| 2 | [environment.md](environment.md) | Fill `.env.local` |
| 3 | [setup.md](setup.md) — Steps 1, 4 | App running + demo data |
| 4 | [setup-twilio.md](setup-twilio.md) | WhatsApp messages working |
| 5 | [setup-local-demo.md](setup-local-demo.md) | Full demo rehearsal |

---

## Step 1 — Get the code and install packages

Open PowerShell:

```powershell
cd C:\Projects\Setu
npm install
```

Wait until it finishes (may take 1–2 minutes).

---

## Step 2 — Create `.env.local`

```powershell
copy .env.example .env.local
```

Open `.env.local` in your editor. You will fill it in during the Supabase and Twilio guides.

**Never commit `.env.local` to Git** — it contains secrets.

---

## Step 3 — Database (Supabase)

👉 **Full walkthrough:** [setup-supabase.md](setup-supabase.md)

Short version:

1. Create free account at [supabase.com](https://supabase.com)
2. Create a new project (remember your database password)
3. Run all SQL files (schema + migrations) in SQL Editor
4. Copy 3 keys into `.env.local`

---

## Step 4 — Auth secret (dashboard login)

Add this line to `.env.local` (any random string):

```env
AUTH_SECRET=my-super-secret-string-change-this-123
```

Also add (same value for both):

```env
CRON_SECRET=demo-secret-123
NEXT_PUBLIC_CRON_SECRET=demo-secret-123
```

---

## Step 5 — Seed demo data

```powershell
npm run seed
```

✅ Success looks like:

```
✓ 4 vendors created
✓ 8 purchase orders created
✅ Seed complete!
```

❌ If you see `supabaseUrl is required` → go back to Step 3 and fix `.env.local`.

---

## Step 6 — Run the app locally

```powershell
npm run dev
```

Open in browser:

- http://localhost:3000/login — create PM account (Signup)
- http://localhost:3000/dashboard — Kanban board (after login)

---

## Step 7 — WhatsApp (Twilio)

👉 **Full walkthrough:** [setup-twilio.md](setup-twilio.md)

You need this for vendors to message the bot. Dashboard works without Twilio; WhatsApp does not.

---

## Step 8 — AI keys (for voice + smart replies)

Sign up and create API keys:

| Service | URL | Put in `.env.local` |
|---------|-----|---------------------|
| Anthropic (Claude) | https://console.anthropic.com | `ANTHROPIC_API_KEY` |
| Deepgram (voice) | https://console.deepgram.com | `DEEPGRAM_API_KEY` |

Without these:

- **Text** WhatsApp messages may still work if Claude key is set
- **Voice notes** need Deepgram
- **Photos (GRN)** need Anthropic (Claude Vision)

---

## Step 9 — Full demo rehearsal

👉 [setup-local-demo.md](setup-local-demo.md)

---

## Quick checklist (print this)

```
[ ] Node.js installed (node -v works)
[ ] npm install completed
[ ] .env.local created from .env.example
[ ] Supabase project created
[ ] All SQL files run in Supabase SQL Editor
[ ] Supabase keys in .env.local
[ ] AUTH_SECRET in .env.local
[ ] npm run seed succeeded
[ ] npm run dev — dashboard loads at /login
[ ] PM account created via /signup
[ ] Twilio account created
[ ] Phone joined Twilio sandbox (join code sent on WhatsApp)
[ ] Vendor phone updated in Supabase
[ ] Twilio webhook URL set (ngrok local OR Vercel production)
[ ] Test WhatsApp message → bot replies
[ ] Dashboard PO card updates
```

---

## If something breaks

👉 [troubleshooting.md](troubleshooting.md)

Common beginner mistakes:

1. **Forgot `.env.local`** — copy from `.env.example` and fill keys
2. **Wrong vendor phone format** — must be `whatsapp:+91XXXXXXXXXX` (exact match with Twilio)
3. **Webhook URL wrong** — must end with `/api/webhook/whatsapp` and use **HTTPS**
4. **Did not join sandbox** — send `join your-code` to Twilio number first
5. **Port confusion** — if dev says port 3001 or 3002, use that in ngrok: `npx ngrok http 3002`

---

## Who to ask for help

| Problem | Check |
|---------|--------|
| Database / seed | [setup-supabase.md](setup-supabase.md) |
| WhatsApp not replying | [setup-twilio.md](setup-twilio.md) |
| Login / dashboard | AUTH_SECRET + migration `006_app_users.sql` |
| Deploy to internet | [hosting.md](hosting.md) or [render.md](render.md) |
