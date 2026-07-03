# Webdiscovery.nl — bouwplan & architectuur

Backend + admin voor een dienst die (1) bedrijven vindt, (2) ze automatisch mailt
met een klaarstaande website, (3) follow-upt, en (4) de opdracht (€500) afrondt.
Geïnspireerd op **sitedrop.ai** (lead finder + AI-builder + facturatie), met de
**sales-/copywriting-aanpak van premiumskills.nl** in de mailteksten.

> premiumskills.nl bleek géén website-bouwer maar een coaching-programma. We nemen
> er alleen de sales-methodiek uit mee (gratis audit als opener, sterke copy),
> geen techniek.

---

## Architectuur (goedkoop — start ≈ €0–30/mnd, budget tot ~€100)

| Laag | Keuze | Kosten |
|---|---|---|
| Frontend + API | **Next.js op Vercel** (heb je al) | €0 (bestaand) |
| Database + Auth + Storage | **Supabase** free tier | €0 tot ~500MB/50k MAU |
| E-mail verzenden | **Resend** | €0 (3k/mnd), daarna ~$20 |
| Betalingen | **Mollie** (iDEAL) | ~€0,30/transactie, geen vast bedrag |
| AI website-generatie | **Claude API** | per gebruik |
| Lead-data | KvK / Google Places / scrape | variabel |

Alles start op gratis tiers; je betaalt pas bij volume/omzet.

---

## Datamodel (staat in `supabase/migrations/0001_init.sql`)

```
leads ─┬─ messages (verzonden/ontvangen mails, opens, klikken)
       ├─ generated_sites (AI-concepten + preview-link)
       ├─ tasks (follow-ups, aangestuurd door cron)
       ├─ events (tijdlijn/audit per lead)
       └─ orders (€500, Mollie, domein, oplevering)

campaigns · email_templates · company_profile · suppressions (afmeldingen)
```

De volledige pijplijn als lead-status:
`new → queued → contacted → opened → replied → interested → site_generated →
sent_preview → followed_up → won/lost`

---

## Wat er nu al staat (FASE 1 — fundament ✅)

- Next.js + Tailwind project, bouwt schoon (`npm run build`).
- Supabase-migraties: volledig datamodel + RLS + seed (NL mailsjablonen).
- Admin-dashboard achter login (Supabase Auth): Overzicht, Leads, Campagnes,
  Berichten, Bestellingen, Instellingen.
- Publieke landingspagina met "gebouwd voor AI"-positionering + KvK-vertrouwen.
- Scaffolding: Resend-mailwrapper (met suppressie-check), **werkende afmeld-endpoint**,
  cron-endpoints (stubs) + `vercel.json` schema, Mollie-webhook (stub).

---

## Roadmap

### FASE 2 — Discovery + outreach-engine
- **Lead-discovery** ✅ — `/admin/discovery`: Google Places (v1 Text Search) OF handmatige
  import (plakken). Verrijking (`enrich.ts`) scrapet de website voor een e-mail + detecteert
  verouderde sites. Segmentatie: website+verouderd+e-mail = beste e-mailprospect;
  geen website = bellijst. Dedup op place_id/e-mail. Zie `src/lib/discovery/*`.
  → Belangrijk: Places geeft géén e-mail; die komt uit de website-scrape. Bedrijven
    zónder website zijn niet mailbaar → aparte lijst.
- **Outreach-cron** (`/api/cron/outreach`) — NOG BOUWEN: intro-mails renderen uit
  `email_templates`, dagelijkse limiet per campagne (deliverability), status bijwerken,
  follow-up-taken plannen. Alleen leads mét e-mail + niet gesuppressed.
- **Follow-up-cron** (`/api/cron/followups`) — NOG BOUWEN: mail na 2 dagen; "bekeken?" via `opened_at`.
- **Reply-afhandeling** — NOG BOUWEN: inkomende mail → `messages` (inbound) → lead op 'interested'.
- **Open/klik-tracking** via Resend webhooks — NOG BOUWEN.

### FASE 3 — AI website-generator + branche-modules  (kern ✅)
- **Gebouwd:** `src/lib/generate/*` (template + optioneel Claude), admin-knop "Genereer site"
  per lead (`/admin/leads`), API `/api/admin/generate`, en publieke preview op
  `/preview/<slug>` die de site rendert met concept-balk + bestel-CTA. Lead-status → `site_generated`.
- **Producteis:** elke site is functioneel compleet + zelf te beheren (klant heeft
  nooit externe hulp nodig). Branche→module-logica staat in `src/lib/modules.ts`
  (booking, quote, webshop, cms, reservations, menu, gallery, reviews…). CMS + contact
  altijd inbegrepen.
- **Aanpak:** modules in-house op Next.js + Supabase (klant beheert alles in één eigen
  paneel). Mix mogelijk: per klant optioneel externe SaaS koppelen (Cal.com, Shopify…) —
  daarom staat "Wij werken samen met" met partnerlogo's op de homepage.
- Uit bedrijfsgegevens (+ evt. bestaande site) een concept-site genereren met Claude →
  modules kiezen via `modulesForBranche()` → opslaan in `generated_sites` (kolom `modules`)
  → preview op `/preview/<slug>` + screenshot voor in de mail.
- **Prijsmodel:** €500 eenmalig + klein maandbedrag (vanaf ~€15/mnd voor hosting, CMS,
  boeking, onderhoud). Datamodel: `orders.plan/monthly_cents` + tabel `subscriptions`
  (migratie 0003).

### FASE 4 — Bestelflow + oplevering
- Publieke bestelpagina vanaf de preview → Mollie-betaling (€500).
- `/api/webhooks/mollie` verifieert betaling → order op 'paid'.
- Stappenplan domeinkoppeling (handmatig of via registrar-API zoals TransIP/Openprovider).
- Bevestigingsmail + oplevering, hosting op `klantnaam.webdiscovery.nl`.

### FASE 5 — Afwerking
- Bewerk-formulieren in de admin (nu deels direct in Supabase).
- Lead-detailpagina met volledige tijdlijn.
- Team-accounts, statistieken, betere `proxy` i.p.v. `middleware`.

---

## ⚠️ Belangrijke aandachtspunten (niet-technisch)

1. **Cold email & spamwet (Telecommunicatiewet art. 11.7)** — geldt óók voor
   mailen naar bedrijven. Elke mail moet afzenderidentiteit + werkende afmeldlink
   bevatten (is ingebouwd). ACM handhaaft met boetes. **Laat dit vóór grootschalige
   verzending juridisch toetsen** — dit is geen juridisch advies.
2. **AVG** — leads bevatten persoonsgegevens; grondslag (gerechtvaardigd belang)
   + wisbaarheid nodig. Suppressielijst is ingebouwd.
3. **Deliverability** — verzend vanaf een apart (sub)domein (bv. `mail.webdiscovery.nl`)
   met correcte SPF/DKIM/DMARC en warm het domein rustig op. Niet vanaf je hoofddomein.
4. **Content-herkomst** — een "vernieuwde" versie van een bestaande site betekent
   hun content/logo hergebruiken; let op auteurs-/merkrecht.
5. **KvK op alle uitingen** — vul echte gegevens in `company_profile` (nu VUL_IN).

---

## Setup (lokaal)

1. Maak een Supabase-project → draai `supabase/migrations/*.sql` in de SQL-editor.
2. Kopieer `.env.local.example` → `.env.local` en vul de sleutels in.
3. Maak in Supabase Auth een admin-gebruiker (e-mail + wachtwoord).
4. `npm run dev` → `/admin/login`.
5. Vul je echte bedrijfsgegevens in tabel `company_profile` (vervang VUL_IN).
