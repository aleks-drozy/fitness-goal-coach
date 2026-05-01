# Maken

> Make weight, fight fresh.

Competition prep for judo and BJJ athletes. Weight cut protocols, training plans, and weekly check-ins built around your weight class and tournament date.

## Stack

- **Next.js 16** (App Router)
- **Supabase** — auth, PostgreSQL, RLS
- **Groq / Llama 3.3** — AI inference
- **Vercel** — deployment
- **Tailwind v4** + Framer Motion

## Dev

```bash
npm install
npm run dev
```

Requires `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GROQ_API_KEY=
RESEND_API_KEY=
EMAIL_FROM=
NEXT_PUBLIC_APP_URL=
CRON_SECRET=
```
