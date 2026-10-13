import { getSql, hasDb } from '@/lib/db';
import { defaultSite } from './defaults';
import { parseSite, type SiteDoc } from './types';

// Opslag van de AITD-site in Neon. Tabellen worden bij eerste gebruik
// aangemaakt (idempotent), zodat er geen handmatige migratie nodig is.

let schemaReady: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      const sql = getSql();
      await sql`create table if not exists aitd_site (
        id int primary key default 1 check (id = 1),
        draft jsonb not null,
        published jsonb,
        rev int not null default 1,
        client_locked boolean not null default false,
        updated_at timestamptz not null default now(),
        updated_by text,
        published_at timestamptz,
        published_by text
      )`;
      await sql`create table if not exists aitd_versions (
        id serial primary key,
        doc jsonb not null,
        note text,
        created_by text,
        created_at timestamptz not null default now()
      )`;
      await sql`create table if not exists aitd_users (
        id serial primary key,
        email text not null unique,
        name text not null default '',
        password_hash text not null,
        session_version int not null default 1,
        active boolean not null default true,
        failed_attempts int not null default 0,
        locked_until timestamptz,
        last_login_at timestamptz,
        created_at timestamptz not null default now()
      )`;
      await sql`create table if not exists aitd_login_attempts (
        id serial primary key,
        ip text not null,
        email text,
        success boolean not null,
        at timestamptz not null default now()
      )`;
      await sql`create index if not exists aitd_login_attempts_ip_at on aitd_login_attempts (ip, at)`;
      await sql`create table if not exists aitd_media (
        id uuid primary key default gen_random_uuid(),
        mime text not null,
        data_b64 text not null,
        bytes int not null,
        width int,
        height int,
        name text not null default '',
        uploaded_by text,
        created_at timestamptz not null default now()
      )`;
      await sql`create table if not exists aitd_audit (
        id serial primary key,
        actor text not null,
        action text not null,
        detail jsonb,
        at timestamptz not null default now()
      )`;
    })().catch((e) => {
      schemaReady = null; // volgende request opnieuw proberen
      throw e;
    });
  }
  return schemaReady;
}

export type SiteRow = {
  draft: SiteDoc;
  published: SiteDoc | null;
  rev: number;
  clientLocked: boolean;
  updatedAt: string;
  updatedBy: string | null;
  publishedAt: string | null;
  publishedBy: string | null;
};

export async function getSiteRow(): Promise<SiteRow> {
  await ensureSchema();
  const sql = getSql();
  let rows = await sql`select * from aitd_site where id = 1`;
  if (!rows[0]) {
    const doc = defaultSite();
    await sql`insert into aitd_site (id, draft, published, published_at, published_by)
              values (1, ${JSON.stringify(doc)}::jsonb, ${JSON.stringify(doc)}::jsonb, now(), 'systeem')
              on conflict (id) do nothing`;
    rows = await sql`select * from aitd_site where id = 1`;
  }
  const r = rows[0];
  const draft = parseSite(r.draft);
  const published = r.published ? parseSite(r.published) : null;
  return {
    draft: draft.ok ? draft.site : defaultSite(),
    published: published && published.ok ? published.site : null,
    rev: r.rev as number,
    clientLocked: r.client_locked as boolean,
    updatedAt: String(r.updated_at),
    updatedBy: (r.updated_by as string) ?? null,
    publishedAt: r.published_at ? String(r.published_at) : null,
    publishedBy: (r.published_by as string) ?? null,
  };
}

// Gepubliceerde versie voor bezoekers. Valt terug op de standaardinhoud als
// er (nog) geen database is of er iets misgaat — de site blijft dus altijd online.
export async function getPublishedSite(): Promise<SiteDoc> {
  if (!hasDb()) return defaultSite();
  try {
    const row = await getSiteRow();
    return row.published ?? defaultSite();
  } catch (e) {
    console.error('[aitd] published laden mislukt', e);
    return defaultSite();
  }
}

// Concept opslaan met optimistische vergrendeling (rev): voorkomt dat klant en
// beheerder elkaars wijzigingen ongemerkt overschrijven.
export async function saveDraft(doc: SiteDoc, expectedRev: number, actor: string) {
  const sql = getSql();
  const rows = await sql`
    update aitd_site set draft = ${JSON.stringify(doc)}::jsonb, rev = rev + 1, updated_at = now(), updated_by = ${actor}
    where id = 1 and rev = ${expectedRev}
    returning rev`;
  if (!rows[0]) return { ok: false as const };
  return { ok: true as const, rev: rows[0].rev as number };
}

export async function publishDraft(actor: string, note: string | null) {
  const sql = getSql();
  const rows = await sql`
    update aitd_site set published = draft, published_at = now(), published_by = ${actor}
    where id = 1 returning published`;
  if (!rows[0]) return false;
  await sql`insert into aitd_versions (doc, note, created_by) values (${JSON.stringify(rows[0].published)}::jsonb, ${note}, ${actor})`;
  return true;
}

export async function audit(actor: string, action: string, detail?: Record<string, unknown>) {
  try {
    const sql = getSql();
    await sql`insert into aitd_audit (actor, action, detail) values (${actor}, ${action}, ${detail ? JSON.stringify(detail) : null}::jsonb)`;
  } catch (e) {
    console.error('[aitd] audit mislukt', e);
  }
}
