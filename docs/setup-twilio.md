# Twilio WhatsApp Setup — Beginner Guide

This guide explains **how vendors use Setu on WhatsApp** and how you connect Twilio to this project.

**Time:** ~30–45 minutes first time.

---

## What is Twilio?

Twilio is a service that lets our **server** send and receive WhatsApp messages.

- Vendors message a **WhatsApp number** (the Twilio sandbox)
- Twilio forwards that message to our app (`/api/webhook/whatsapp`)
- Our app replies → Twilio sends the reply back on WhatsApp

For the hackathon demo we use the **Twilio Sandbox** (free, no Meta business verification).

---

## Part A — Create Twilio account

1. Go to https://www.twilio.com/try-twilio
2. Sign up (email + phone verification)
3. You land on the **Twilio Console** dashboard

### Copy these two values

On the Console home page, find **Account Info**:

| Twilio shows | Put in `.env.local` |
|--------------|---------------------|
| Account SID | `TWILIO_ACCOUNT_SID` |
| Auth Token (click to reveal) | `TWILIO_AUTH_TOKEN` |

Example `.env.local`:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

> The default sandbox sender is `whatsapp:+14155238886` — keep this unless Twilio shows a different number.

---

## Part B — Join the WhatsApp Sandbox (on your phone)

Vendors (and you) must **join** the sandbox before they can talk to the bot.

1. In Twilio Console, go to:  
   **Messaging** → **Try it out** → **Send a WhatsApp message**
2. You will see:
   - A **sandbox number** (e.g. `+1 415 523 8886`)
   - A **join code** (e.g. `join happy-tiger`)

3. On your phone, open **WhatsApp**
4. Start a chat with the sandbox number: `+1 415 523 8886`
5. Send exactly: `join happy-tiger` (use **your** code from the console)

You should get a reply from Twilio confirming you joined.

6. **Repeat on a second phone** if you want to demo vendor + PM separately.

✅ Sandbox joined when Twilio replies with a success message.

---

## Part C — Register vendor phone in database

Setu only replies to **registered vendors** in Supabase.

After `npm run seed`, vendors have placeholder numbers. You must update them.

### Find your WhatsApp number format

When you message the sandbox, Twilio sees your number as:

```text
whatsapp:+91XXXXXXXXXX
```

(Country code + number, with `whatsapp:` prefix.)

### Update in Supabase

1. Open [supabase.com/dashboard](https://supabase.com/dashboard) → your project
2. **Table Editor** → `vendors` table
3. Edit **Ramesh Rebar Supplies** → set `phone` to your real number, e.g.:

```text
whatsapp:+919876543210
```

Or run in **SQL Editor**:

```sql
UPDATE vendors
SET phone = 'whatsapp:+91XXXXXXXXXX'
WHERE name = 'Ramesh Rebar Supplies';
```

Replace `XXXXXXXXXX` with the phone you used to join the sandbox.

⚠️ **Must match exactly** — wrong format = "vendor not registered" reply.

---

## Part D — Connect Twilio to our app (webhook)

Twilio must know **where to send** incoming messages. That URL is the **webhook**.

Our endpoint is always:

```text
POST https://<your-public-url>/api/webhook/whatsapp
```

You have two options:

### Option 1 — Local testing (ngrok) — good for development

Your laptop is not on the public internet. **ngrok** creates a temporary public URL.

**Terminal 1** — run the app:

```powershell
cd C:\Projects\Setu
npm run dev
```

Note the port (e.g. `http://localhost:3000` or `3002`).

**Terminal 2** — run ngrok (use the same port):

```powershell
npx ngrok http 3000
```

ngrok shows something like:

```text
Forwarding   https://abc123.ngrok-free.app -> http://localhost:3000
```

Copy the **https** URL.

**In Twilio Console:**

1. **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Scroll to **Sandbox settings**
3. **When a message comes in:**
   - URL: `https://abc123.ngrok-free.app/api/webhook/whatsapp`
   - Method: **POST**
4. Click **Save**

**Optional — status callback:**

- URL: `https://abc123.ngrok-free.app/api/webhook/whatsapp/status`

> ngrok URL changes every time you restart ngrok (free tier). Update Twilio each time.

### Option 2 — Production (Vercel) — good for demo day

1. Deploy app to Vercel (see [hosting.md](hosting.md))
2. Add all `.env.local` variables in Vercel project settings
3. Your URL is like: `https://setu-xxx.vercel.app`
4. Twilio webhook:

```text
https://setu-xxx.vercel.app/api/webhook/whatsapp
```

Method: **POST**

---

## Part E — Test that it works

### Test 1 — Webhook is alive

With `npm run dev` running:

```powershell
npm run check:webhook
```

Or open in browser: `http://localhost:3000/api/webhook/whatsapp/verify`

Expected JSON: `"status": "ok"`

### Test 2 — Send a WhatsApp text

From your vendor phone (joined sandbox, registered in DB):

```text
PO-1042 rebar do din late hoga transport problem
```

Expected:

1. Bot replies on WhatsApp within ~10 seconds
2. Dashboard PO-1042 updates (refresh or wait for realtime)

### Test 3 — Send a voice note (needs Deepgram)

Record a short Hindi message about PO-1042.

Requires `DEEPGRAM_API_KEY` in `.env.local`.

### Test 4 — Send a photo (needs Anthropic)

Send an image of goods or a delivery challan.

Requires `ANTHROPIC_API_KEY` in `.env.local`.

---

## How the vendor uses the app (explain to judges)

1. Vendor receives a **nudge** on WhatsApp (from agent or manual test)
2. Vendor replies in **Hindi / Hinglish** — text or voice
3. Vendor sends **delivery photo** when material ships
4. Vendor gets a **short confirmation** on WhatsApp

They never open a browser or install anything.

---

## Twilio troubleshooting

| Symptom | Fix |
|---------|-----|
| No reply from bot | Check webhook URL in Twilio; must be HTTPS and end with `/api/webhook/whatsapp` |
| "Vendor not registered" | Update `vendors.phone` in Supabase to match your WhatsApp number exactly |
| Twilio shows errors in debugger | Twilio Console → **Monitor** → **Logs** → **Errors** |
| ngrok works once then stops | Free ngrok URL changed — update Twilio webhook |
| 403 on webhook | Production validates Twilio signature — ensure `TWILIO_AUTH_TOKEN` is correct |
| Bot replies but dashboard empty | Supabase keys wrong or seed not run |
| Join sandbox failed | Send join code to correct number; no extra spaces |

---

## Twilio Console quick links

| Task | Where in Twilio |
|------|-----------------|
| Sandbox join code | Messaging → Try it out → Send a WhatsApp message |
| Set webhook URL | Same page → Sandbox settings → When a message comes in |
| See message logs | Monitor → Logs → Messaging |
| Account SID / Token | Console home → Account Info |

---

## Next steps

- Full local demo script: [setup-local-demo.md](setup-local-demo.md)
- Deploy for public URL: [hosting.md](hosting.md)
- Back to master checklist: [setup-beginner.md](setup-beginner.md)
