-- Zoek-targets voor de dagelijkse discovery. Den Haag heeft de hoogste prioriteit;
-- de runner werkt targets af op volgorde (langst niet gedraaid + hoogste prioriteit),
-- zodat het vanzelf uitbreidt naar meer branches en plaatsen.
create table if not exists search_targets (
  id          uuid primary key default gen_random_uuid(),
  branche     text not null,
  plaats      text not null,
  priority    int not null default 5,
  active      boolean not null default true,
  last_run_at timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists search_targets_order_idx on search_targets (last_run_at nulls first, priority desc);

alter table search_targets enable row level security;

-- Seed: 15 branches × 6 plaatsen (Den Haag prioriteit 10, rest 5).
insert into search_targets (branche, plaats, priority)
select b, p, case when p = 'Den Haag' then 10 else 5 end
from unnest(array[
  'kapper','kapsalon','restaurant','café','aannemer','loodgieter','hovenier',
  'schilder','tandarts','fysiotherapie','schoonheidssalon','rijschool',
  'bloemist','fietsenwinkel','garagebedrijf'
]) as b
cross join unnest(array[
  'Den Haag','Rijswijk','Voorburg','Wassenaar','Delft','Zoetermeer'
]) as p
on conflict do nothing;
