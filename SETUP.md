# Finance Tracker 1.0 — Setup Guide

## Prerequisites

1. **Node.js 18+** — download from https://nodejs.org (LTS version)
2. **Supabase account** — https://app.supabase.com (free tier is fine)
3. **Gmail account** with 2-Step Verification enabled (for email alerts)
4. **Vercel account** — https://vercel.com (free tier is fine)
5. **GitHub account** — to connect Vercel to your repo

---

## Step 1 — Install Node.js

Download from https://nodejs.org and install the LTS version. After install, restart your terminal and verify:

```
node --version   # should print v18+ or v20+
npm --version
```

---

## Step 2 — Install dependencies

Open a terminal in the `finance-tracker` folder and run:

```bash
npm install
npx shadcn-ui@latest init
# Accept all defaults: New York style, Slate base color, CSS variables = yes
```

---

## Step 3 — Create Supabase project

1. Go to https://app.supabase.com → New project
2. Note down your **Project URL** and **anon key** (Settings → API)
3. Also copy the **service_role key** (Settings → API → service_role — keep secret)
4. Go to **SQL Editor** and paste the entire contents of `supabase/migration.sql`, then click **Run**
5. Go to **Authentication → Settings** → make sure **Email** provider is enabled
   - For development: disable "Confirm email" so you can log in immediately

---

## Step 4 — Gmail App Password

1. Go to your Google Account → Security → 2-Step Verification (enable it if not already)
2. Go to Security → App passwords
3. Select "Mail" and "Other (custom name)" → type "Finance Tracker"
4. Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)

---

## Step 5 — Create .env.local

Copy `.env.local.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
GMAIL_USER=your@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
CRON_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(16).toString('hex'))">
```

---

## Step 6 — Run locally

```bash
npm run dev
```

Open http://localhost:3000 in your browser. Register an account and start using the app.

**On your phone:** connect it to the same Wi-Fi as your PC, then open `http://<your-pc-ip>:3000` in the phone's browser.

---

## Step 7 — Deploy to Vercel

1. Push the `finance-tracker` folder to a GitHub repository
2. Go to https://vercel.com → Import project → select your repo
3. Framework: **Next.js** (auto-detected)
4. Add all 6 environment variables from `.env.local` (under Settings → Environment Variables)
   - `NEXT_PUBLIC_*` keys: enable **Browser** scope
5. Click **Deploy**
6. Vercel will read `vercel.json` and register the cron job automatically (Hobby plan supports 1 cron)

---

## Step 8 — Test the email cron manually

After deploying, run this to trigger the cron manually.

**PowerShell (Windows):**
```powershell
Invoke-WebRequest -Uri "https://<your-app>.vercel.app/api/cron/send-reminders" `
  -Headers @{ Authorization = "Bearer <your-CRON_SECRET>" }
```

**Or use curl.exe directly (avoids the PowerShell alias):**
```powershell
curl.exe -H "Authorization: Bearer <your-CRON_SECRET>" https://<your-app>.vercel.app/api/cron/send-reminders
```

Expected response: `{"sent":N,"total":N}`

---

## Feature overview

| Feature | Where |
|---|---|
| Add income / expense | Transactions → New Transaction |
| Split into installments | Transactions → New Transaction → toggle "Split into installments" |
| View by month | Transactions → use the month navigator |
| Dashboard charts | Dashboard |
| Manage categories | Categories |
| Manage persons | Persons |
| Email reminders | Email Alerts |
| Duplicate warning | Automatic when saving a transaction with same category + value + date |
