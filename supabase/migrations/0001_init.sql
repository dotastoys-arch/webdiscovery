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
-- Row Level Security
-- Ingelogde admins mogen alles; anon niets. Service-role omzeilt RLS.
-- =============================================================
do $$
declare t text;
begin
  foreach t in array array[
    'company_profile','leads','campaigns','email_templates','messages',
    'generated_sites','tasks','orders','suppressions','events'
  ] loop
    execute format('alter table %I enable row level security;', t);
    execute format(
      'create policy "admin_all" on %I for all to authenticated using (true) with check (true);', t
    );
  end loop;
end $$;
