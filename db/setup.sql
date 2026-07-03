-- Neon-klare database-setup voor WebDiscovery.
-- Plak dit volledig in de Neon SQL Editor en klik Run.

-- =============================================================
-- Webdiscovery.nl — kern-datamodel (fundament)
-- =============================================================
-- Dit schema is de ruggengraat waar alle onderdelen op aansluiten:
--   leads (discovery) -> campaigns/messages (outreach) ->
--   generated_sites (AI-generator) -> tasks (follow-ups) -> orders (bestelflow)
--
-- RLS staat aan; ingelogde admins (Supabase Auth) mogen alles.
-- De service-role sleutel (server-side) omzeilt RLS voor cron/webhooks.
-- =============================================================

create extension if not exists "pgcrypto";

-- ---------- helper: updated_at trigger ----------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =============================================================
-- 1. Ons eigen bedrijfsprofiel (1 rij) — voor mailfooters, KvK etc.
-- =============================================================
create table company_profile (
  id             uuid primary key default gen_random_uuid(),
  name           text not null default 'Webdiscovery',
  legal_name     text,
  kvk_number     text,
  vat_number     text,
  address        text,
  postal_code    text,
  city           text,
  country        text default 'Nederland',
  email          text,
  phone          text,
  website        text default 'https://webdiscovery.nl',
  sender_name    text,                 -- afzendernaam in mails
  sender_email   text,                 -- verzendadres (apart (sub)domein aanbevolen)
  standard_price_cents int not null default 50000,  -- €500,-
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create trigger t_company_profile_updated before update on company_profile
  for each row execute function set_updated_at();

-- =============================================================
-- 2. Leads — bedrijven gevonden via discovery
-- =============================================================
create type lead_status as enum (
  'new','queued','contacted','opened','replied','interested',
  'site_generated','sent_preview','followed_up','won','lost','unsubscribed'
);

create table leads (
  id            uuid primary key default gen_random_uuid(),
  company_name  text not null,
  kvk_number    text,
  website_url   text,
  has_website   boolean,               -- true=heeft site, false=geen site (beste prospect)
  email         text,
  phone         text,
  address       text,
  postal_code   text,
  city          text,
  industry      text,
  source        text,                  -- 'kvk','google_places','manual','import'
  source_ref    text,
  notes         text,
  status        lead_status not null default 'new',
  score         int,                   -- prioriteitsscore
  discovered_at timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create unique index leads_email_uniq on leads (lower(email)) where email is not null;
create index leads_status_idx on leads (status);
create index leads_has_website_idx on leads (has_website);
create trigger t_leads_updated before update on leads
  for each row execute function set_updated_at();

-- =============================================================
-- 3. Campagnes
-- =============================================================
create type campaign_status as enum ('draft','active','paused','completed');

create table campaigns (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  description      text,
  status           campaign_status not null default 'draft',
  daily_send_limit int not null default 30,   -- rustig aan i.v.m. deliverability
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create trigger t_campaigns_updated before update on campaigns
  for each row execute function set_updated_at();

-- =============================================================
-- 4. E-mailsjablonen (per stap in de funnel)
-- =============================================================
create type email_step as enum (
  'intro','preview_offer','followup_2day','followup_final','reply_interested'
);

create table email_templates (
  id         uuid primary key default gen_random_uuid(),
  step       email_step not null,
  name       text not null,
  subject    text not null,
  body_html  text not null,
  body_text  text,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);
create index email_templates_step_idx on email_templates (step) where is_active;

-- =============================================================
-- 5. Berichten (verzonden + ontvangen)
-- =============================================================
create type message_direction as enum ('outbound','inbound');
create type message_status as enum (
  'queued','sent','delivered','opened','clicked','bounced','failed','received'
);

create table messages (
  id           uuid primary key default gen_random_uuid(),
  lead_id      uuid references leads(id) on delete cascade,
  campaign_id  uuid references campaigns(id) on delete set null,
  template_id  uuid references email_templates(id) on delete set null,
  step         email_step,
  direction    message_direction not null,
  status       message_status not null default 'queued',
  subject      text,
  body_html    text,
  body_text    text,
  provider_id  text,                  -- Resend message id
  scheduled_at timestamptz,
  sent_at      timestamptz,
  opened_at    timestamptz,
  clicked_at   timestamptz,
  replied_at   timestamptz,
  created_at   timestamptz not null default now()
);
create index messages_lead_idx on messages (lead_id);
create index messages_status_idx on messages (status);
create index messages_scheduled_idx on messages (scheduled_at) where status = 'queued';

-- =============================================================
-- 6. AI-gegenereerde websites (portfolio-concepten per lead)
-- =============================================================
create type site_status as enum (
  'draft','generating','ready','sent','revising','published','archived'
);

create table generated_sites (
  id                 uuid primary key default gen_random_uuid(),
  lead_id            uuid references leads(id) on delete cascade,
  status             site_status not null default 'draft',
  preview_slug       text unique,      -- bijv. klantnaam -> /preview/<slug>
  preview_url        text,
  source_website_url text,             -- bestaande site die we 'vernieuwen'
  brief              text,             -- brief/prompt voor generatie
  content            jsonb,            -- gegenereerde structuur/content
  screenshot_url     text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index generated_sites_lead_idx on generated_sites (lead_id);
create trigger t_generated_sites_updated before update on generated_sites
  for each row execute function set_updated_at();

-- =============================================================
-- 7. Taken / follow-ups (aangestuurd door cron)
-- =============================================================
create type task_type as enum (
  'send_intro','send_preview','followup_2day','followup_final',
  'manual_review','reply_followup','generate_site'
);
create type task_status as enum ('pending','done','cancelled');

create table tasks (
  id           uuid primary key default gen_random_uuid(),
  lead_id      uuid references leads(id) on delete cascade,
  type         task_type not null,
  status       task_status not null default 'pending',
  due_at       timestamptz not null default now(),
  payload      jsonb,
  completed_at timestamptz,
  created_at   timestamptz not null default now()
);
create index tasks_due_idx on tasks (due_at) where status = 'pending';
create index tasks_lead_idx on tasks (lead_id);

-- =============================================================
-- 8. Bestellingen (€500 standaard)
-- =============================================================
create type order_status as enum (
  'pending','awaiting_payment','paid','domain_setup','delivered','cancelled','refunded'
);

create table orders (
  id                uuid primary key default gen_random_uuid(),
  lead_id           uuid references leads(id) on delete set null,
  site_id           uuid references generated_sites(id) on delete set null,
  amount_cents      int not null default 50000,
  currency          text not null default 'EUR',
  status            order_status not null default 'pending',
  mollie_payment_id text,
  domain            text,
  customer_name     text,
  customer_email    text,
  customer_company  text,
  paid_at           timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index orders_status_idx on orders (status);
create trigger t_orders_updated before update on orders
  for each row execute function set_updated_at();

-- =============================================================
-- 9. Suppressielijst (afmeldingen / bounces) — AVG & compliance
-- =============================================================
create table suppressions (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  reason     text,                     -- 'unsubscribe','bounce','complaint','manual'
  created_at timestamptz not null default now()
);
create unique index suppressions_email_uniq on suppressions (lower(email));

-- =============================================================
-- 10. Events / tijdlijn (audit log per lead)
-- =============================================================
create table events (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid references leads(id) on delete cascade,
  type       text not null,
  data       jsonb,
  created_at timestamptz not null default now()
);
create index events_lead_idx on events (lead_id, created_at desc);


-- =============================================================
-- Seed: bedrijfsprofiel + Nederlandse e-mailsjablonen
-- Pas de VUL_IN-velden aan met je echte KvK/adresgegevens.
-- Placeholders in sjablonen worden runtime vervangen:
--   {{company_name}}   = naam van het lead-bedrijf
--   {{preview_url}}    = link naar de klaarstaande website
--   {{sender_name}}    = jouw naam
--   {{kvk_number}}     = KvK-nummer (vertrouwen)
--   {{unsubscribe_url}}= verplichte afmeldlink
-- =============================================================

insert into company_profile
  (name, legal_name, kvk_number, vat_number, address, postal_code, city,
   email, phone, website, sender_name, sender_email, standard_price_cents)
values
  ('WebDiscovery', 'WebDiscovery', '96004177', 'NL005189518B08',
   'Pijlspitskreek 3', '2241 MT', 'Wassenaar',
   'info@webdiscovery.nl', '+31 85 212 90 77', 'https://webdiscovery.nl',
   'Team WebDiscovery', 'info@webdiscovery.nl', 50000);

-- ---------- INTRO: eerste contact ----------
insert into email_templates (step, name, subject, body_html, body_text) values
('intro', 'Intro — website staat klaar',
 'Een vernieuwde website voor {{company_name}} — staat klaar om te bekijken',
$$<p>Hoi,</p>
<p>Wij zijn Webdiscovery, een erkend Nederlands webbureau (KvK {{kvk_number}}). Wij bouwen moderne websites die niet alleen mooi zijn, maar ook goed gevonden worden — óók door AI-zoekmachines zoals ChatGPT en Google's AI-overzichten.</p>
<p>We zagen <strong>{{company_name}}</strong> en hebben alvast een vernieuwd ontwerp voor jullie klaargezet. Geen verplichtingen — even kijken kan gewoon:</p>
<p><a href="{{preview_url}}">👉 Bekijk de website die voor jullie klaarstaat</a></p>
<p>Wat vind je ervan? Een korte reactie is genoeg.</p>
<p>Hartelijke groet,<br>{{sender_name}}<br>Webdiscovery · KvK {{kvk_number}}</p>
<hr><p style="font-size:12px;color:#888">Je ontvangt deze mail omdat we denken dat dit relevant is voor {{company_name}}. Geen interesse? <a href="{{unsubscribe_url}}">Afmelden</a> — dan hoor je niets meer van ons.</p>$$,
$$Hoi,

Wij zijn Webdiscovery, een erkend Nederlands webbureau (KvK {{kvk_number}}). Wij bouwen moderne websites die goed gevonden worden, ook door AI-zoekmachines.

We hebben alvast een vernieuwd ontwerp voor {{company_name}} klaargezet. Even kijken kan vrijblijvend:
{{preview_url}}

Wat vind je ervan?

Groet,
{{sender_name}}
Webdiscovery · KvK {{kvk_number}}

Afmelden: {{unsubscribe_url}}$$);

-- ---------- PREVIEW_OFFER: mét de link + prijs ----------
insert into email_templates (step, name, subject, body_html, body_text) values
('preview_offer', 'Preview + aanbod €500',
 'Jullie nieuwe website — inclusief prijs en hoe je live gaat',
$$<p>Hoi,</p>
<p>Fijn dat je interesse hebt! Dit is de website die we voor <strong>{{company_name}}</strong> hebben gemaakt:</p>
<p><a href="{{preview_url}}">👉 Bekijk jullie website</a></p>
<p>Voor <strong>€500,-</strong> maken we hem helemaal af naar jullie wensen, koppelen we jullie domeinnaam en zetten we hem live. Je kunt direct online via een simpel stappenplan.</p>
<p>Zullen we hem live zetten? Reageer gerust op deze mail met je vragen.</p>
<p>Groet,<br>{{sender_name}}<br>Webdiscovery · KvK {{kvk_number}}</p>
<hr><p style="font-size:12px;color:#888"><a href="{{unsubscribe_url}}">Afmelden</a></p>$$,
$$Hoi,

Fijn dat je interesse hebt! Dit is de website voor {{company_name}}:
{{preview_url}}

Voor €500,- maken we hem af naar wens, koppelen we jullie domein en zetten we hem live.

Zullen we hem live zetten?

Groet,
{{sender_name}}
Webdiscovery · KvK {{kvk_number}}

Afmelden: {{unsubscribe_url}}$$);

-- ---------- FOLLOWUP_2DAY: 2 dagen later ----------
insert into email_templates (step, name, subject, body_html, body_text) values
('followup_2day', 'Follow-up na 2 dagen',
 'Heb je de website voor {{company_name}} al kunnen bekijken?',
$$<p>Hoi,</p>
<p>Een paar dagen geleden stuurde ik de website die we voor <strong>{{company_name}}</strong> hebben klaargezet. Heb je hem al kunnen bekijken?</p>
<p><a href="{{preview_url}}">👉 Hier staat hij nog</a></p>
<p>Ik ben benieuwd wat je ervan vindt — ook als het een &quot;nee&quot; is, dan weet ik het. 😊</p>
<p>Groet,<br>{{sender_name}}<br>Webdiscovery · KvK {{kvk_number}}</p>
<hr><p style="font-size:12px;color:#888"><a href="{{unsubscribe_url}}">Afmelden</a></p>$$,
$$Hoi,

Een paar dagen geleden stuurde ik de website voor {{company_name}}. Heb je hem al kunnen bekijken?
{{preview_url}}

Benieuwd wat je ervan vindt — ook als het een nee is.

Groet,
{{sender_name}}
Webdiscovery · KvK {{kvk_number}}

Afmelden: {{unsubscribe_url}}$$);

-- ---------- FOLLOWUP_FINAL: laatste herinnering ----------
insert into email_templates (step, name, subject, body_html, body_text) values
('followup_final', 'Laatste herinnering',
 'Laatste mail over de website voor {{company_name}}',
$$<p>Hoi,</p>
<p>Ik wil je niet lastigvallen, dus dit is mijn laatste mailtje hierover. De website voor <strong>{{company_name}}</strong> staat nog klaar:</p>
<p><a href="{{preview_url}}">👉 Bekijken</a></p>
<p>Interesse? Antwoord gewoon op deze mail. Anders hoor je niets meer van me — succes met alles!</p>
<p>Groet,<br>{{sender_name}}<br>Webdiscovery · KvK {{kvk_number}}</p>
<hr><p style="font-size:12px;color:#888"><a href="{{unsubscribe_url}}">Afmelden</a></p>$$,
$$Hoi,

Dit is mijn laatste mail hierover. De website voor {{company_name}} staat nog klaar:
{{preview_url}}

Interesse? Antwoord op deze mail. Anders hoor je niets meer van me.

Groet,
{{sender_name}}
Webdiscovery · KvK {{kvk_number}}

Afmelden: {{unsubscribe_url}}$$);

-- ---------- REPLY_INTERESTED: reactie bij interesse ----------
insert into email_templates (step, name, subject, body_html, body_text) values
('reply_interested', 'Reactie bij interesse',
 'Top! Zo gaan we jullie website live zetten',
$$<p>Hoi,</p>
<p>Wat leuk dat je verder wilt met de website voor <strong>{{company_name}}</strong>! Zo werkt het:</p>
<ol>
<li>We stemmen de laatste wensen af (teksten, kleuren, foto's).</li>
<li>Je koppelt of registreert je domeinnaam — we helpen je stap voor stap.</li>
<li>Je rekent veilig €500,- af (iDEAL).</li>
<li>Wij zetten de site live — vaak binnen een paar dagen.</li>
</ol>
<p>Zullen we starten? Laat maar weten, dan stuur ik je de link om alles te regelen.</p>
<p>Groet,<br>{{sender_name}}<br>Webdiscovery · KvK {{kvk_number}}</p>$$,
$$Hoi,

Wat leuk dat je verder wilt met de website voor {{company_name}}! Zo werkt het:
1. We stemmen de laatste wensen af.
2. Je koppelt/registreert je domein — we helpen stap voor stap.
3. Je rekent veilig €500,- af (iDEAL).
4. Wij zetten de site live, vaak binnen een paar dagen.

Zullen we starten?

Groet,
{{sender_name}}
Webdiscovery · KvK {{kvk_number}}$$);

-- =============================================================
-- Modules per site + abonnementen (€500 eenmalig + klein maandbedrag)
-- =============================================================

-- Welke functionele modules de gegenereerde site heeft (bv. ['cms','booking']).
-- Zie src/lib/modules.ts voor de branche→module-logica.
alter table generated_sites
  add column if not exists modules jsonb not null default '[]'::jsonb;

-- Bestellingen: naast de eenmalige prijs ook het maandbedrag vastleggen.
alter table orders
  add column if not exists plan text default 'standaard',
  add column if not exists monthly_cents int not null default 0;

-- Abonnementen: doorlopende hosting/CMS/boeking + onderhoud per klant.
create type subscription_status as enum ('active', 'past_due', 'paused', 'cancelled');

create table if not exists subscriptions (
  id                 uuid primary key default gen_random_uuid(),
  order_id           uuid references orders(id) on delete set null,
  lead_id            uuid references leads(id) on delete set null,
  status             subscription_status not null default 'active',
  monthly_cents      int not null default 1500,      -- bv. €15/mnd
  mollie_customer_id text,
  mollie_subscription_id text,
  started_at         timestamptz,
  next_billing_at    timestamptz,
  cancelled_at       timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists subscriptions_status_idx on subscriptions (status);
create trigger t_subscriptions_updated before update on subscriptions
  for each row execute function set_updated_at();

