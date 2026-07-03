# Webdiscovery.nl

Backend + admin voor het automatisch vinden, benaderen en bedienen van bedrijven
met klaarstaande websites (vanaf €500).

**Zie [PLAN.md](./PLAN.md) voor de volledige architectuur, roadmap en aandachtspunten.**

## Stack
Next.js (Vercel) · Supabase (Postgres/Auth) · Resend (mail) · Mollie (betaling) · Claude API (generatie)

## Snel starten
```bash
cp .env.local.example .env.local   # vul de sleutels in
npm run dev                        # → http://localhost:3000  (admin: /admin/login)
```
Draai eerst `supabase/migrations/*.sql` in je Supabase-project en maak een admin-user aan.
