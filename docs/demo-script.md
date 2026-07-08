# Demo Script — 2 Minutes

Use this script for hackathon stage presentation and video submission.

---

## Setup before demo (5 min prior)

- [ ] Dashboard loaded with seed data (`npm run seed`)
- [ ] Vendor phone updated in Supabase to match sandbox phone
- [ ] Twilio webhook pointing to live URL
- [ ] Two phones ready: vendor + screen recording
- [ ] Dashboard open on laptop, realtime visible

---

## Script

### 0:00–0:15 — Problem

> "Construction supply chains lose billions to delays vendors already know about — they just tell someone on a phone call, not a system."

Show stat: ~80% of project costs committed at procurement stage.

### 0:15–0:30 — Solution intro

> "Instead of asking vendors to learn new software, we go where they already are."

Show WhatsApp on phone.

### 0:30–1:00 — Live voice note demo

1. Send Hindi voice note as vendor: *"Bhai rebar do din late hoga, transport mein dikkat hai"*
2. Cut to dashboard — PO-1042 card moves to **Delayed**
3. Click PO → show transcript + extracted JSON in thread

> "Voice note in Hindi → structured update in 8 seconds. No app. No English."

### 1:00–1:20 — Photo GRN demo

1. Send delivery photo from vendor phone
2. Dashboard shows GRN verification — item match, quantity check

> "Photo of the truck becomes an auto-verified goods received note."

### 1:20–1:45 — Agent loop demo

1. Click **Trigger Agent Check** on dashboard
2. Show nudge arriving on vendor's WhatsApp (stale PO)
3. Show escalation alert on dashboard for PO with 2 unanswered nudges

> "This isn't a chatbot logging messages — it's an agent that chases the delay before it becomes your problem."

### 1:45–2:00 — Close

> "Every other construction AI tool assumes email and ERPs. India's supply chain runs on WhatsApp and voice notes. Setu is built for how construction actually happens here."

End card: team name, track, live URL.

---

## Backup if live fails

- Pre-record WhatsApp screen + dashboard side by side
- Use `/dashboard/pipeline` to show audit log of past events
- Use seeded PO-1044 delay update as fallback thread view

---

## Key URLs to have open

| Tab | URL |
|-----|-----|
| Dashboard | `/dashboard` |
| Pipeline log | `/dashboard/pipeline` |
| Health | `/api/health` |
| Stats | `/api/stats` |
