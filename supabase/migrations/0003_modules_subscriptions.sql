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

alter table subscriptions enable row level security;
create policy "admin_all" on subscriptions for all to authenticated using (true) with check (true);
