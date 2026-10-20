import { getSql, hasDb } from '@/lib/db';
import { aboutBlock, defaultSite } from './defaults';
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
      // Wanneer het eigen domein voor het eerst bezocht werd (= live voor zoekmachines).
      await sql`alter table aitd_site add column if not exists domain_live_at timestamptz`;
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
      await sql`create table if not exists aitd_content_migrations (
        id text primary key,
        applied_at timestamptz not null default now()
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
  domainLiveAt: string | null;
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
  if (await applyContentMigrations()) rows = await sql`select * from aitd_site where id = 1`;
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
    domainLiveAt: r.domain_live_at ? String(r.domain_live_at) : null,
  };
}

// Eenmalige inhoudsupdates die wij (WebDiscovery) namens de klant doorvoeren.
// Elke update draait precies één keer (ook bij meerdere servers tegelijk) en
// komt niet terug als de klant het onderdeel later zelf weghaalt.
type BlockJson = { id?: string; type?: string; nav?: string; data?: Record<string, unknown> };
type SiteJson = { layout?: string; pages?: { slug?: string; title?: string; blocks?: BlockJson[] }[] };

const CONTENT_MIGRATIONS: { id: string; apply: (doc: SiteJson) => boolean }[] = [
  {
    // About-onderdeel op de homepage, vóór het contactformulier.
    id: '2026-10-about',
    apply: (doc) => {
      const blocks = doc.pages?.[0]?.blocks;
      if (!blocks || blocks.some((b) => b.id === 'about')) return false;
      const at = blocks.findIndex((b) => b.type === 'contact');
      blocks.splice(at < 0 ? blocks.length : at, 0, aboutBlock());
      return true;
    },
  },
  {
    // Op verzoek: de one-page begint met About (direct onder het openingsblok).
    id: '2026-10-about-first',
    apply: (doc) => {
      const blocks = doc.pages?.[0]?.blocks;
      if (!blocks) return false;
      const from = blocks.findIndex((b) => b.id === 'about');
      const to = blocks[0]?.type === 'hero' ? 1 : 0;
      if (from < 0 || from === to) return false;
      const [about] = blocks.splice(from, 1);
      blocks.splice(to, 0, about);
      return true;
    },
  },
  {
    // Op verzoek: About toch weer onderaan, direct vóór het contactformulier.
    id: '2026-10-about-before-contact',
    apply: (doc) => {
      const blocks = doc.pages?.[0]?.blocks;
      if (!blocks) return false;
      const from = blocks.findIndex((b) => b.id === 'about');
      if (from < 0) return false;
      const [about] = blocks.splice(from, 1);
      const contact = blocks.findIndex((b) => b.type === 'contact');
      const to = contact < 0 ? blocks.length : contact;
      blocks.splice(to, 0, about);
      return to !== from;
    },
  },
  {
    // Herstel: in het beheer was per ongeluk "Meerdere pagina's" gekozen met een losse
    // "About us"-pagina, waardoor het one-page-menu verdween. Terug naar één pagina;
    // de aangepaste About-tekst van die losse pagina gaat naar het About-onderdeel.
    // De losse pagina blijft bewaard (alleen zichtbaar bij "Meerdere pagina's").
    id: '2026-10-restore-one-page',
    apply: (doc) => {
      let changed = false;
      if (doc.layout === 'multi_page') {
        doc.layout = 'one_page';
        changed = true;
      }
      const home = doc.pages?.[0]?.blocks;
      const about = home?.find((b) => b.id === 'about');
      const extra = doc.pages
        ?.slice(1)
        .flatMap((p) => p.blocks ?? [])
        .find((b) => b.type === 'text' && typeof b.data?.body === 'string' && (b.data.body as string).includes('political and security analyst'));
      if (about?.data && extra?.data && about.data.body !== extra.data.body) {
        about.data.body = extra.data.body;
        changed = true;
      }
      if (about && !about.nav) {
        about.nav = 'About';
        changed = true;
      }
      return changed;
    },
  },
];

// Alle openstaande updates worden in één keer op het document toegepast en met
// één voorwaardelijke schrijfactie (rev-check) opgeslagen. Gelijktijdige
// paginaweergaven (ook op meerdere servers) kunnen elkaar zo niet in de weg zitten:
// wie te laat is, leest opnieuw en ziet dat er niets meer te doen is.
let migrationsRun: Promise<boolean> | null = null;
function applyContentMigrations(): Promise<boolean> {
  if (!migrationsRun) {
    migrationsRun = runContentMigrations().catch((e) => {
      migrationsRun = null; // volgende request opnieuw proberen
      throw e;
    });
  }
  return migrationsRun;
}

async function runContentMigrations(): Promise<boolean> {
  const sql = getSql();
  for (let attempt = 0; attempt < 5; attempt++) {
    const done = new Set((await sql`select id from aitd_content_migrations`).map((r) => r.id as string));
    const pending = CONTENT_MIGRATIONS.filter((m) => !done.has(m.id));
    if (!pending.length) return false;

    const rows = await sql`select draft, published, rev from aitd_site where id = 1`;
    if (!rows[0]) return false;
    const draft = rows[0].draft as SiteJson;
    const published = rows[0].published as SiteJson | null;
    let dChanged = false;
    let pChanged = false;
    for (const m of pending) {
      if (m.apply(draft)) dChanged = true;
      if (published && m.apply(published)) pChanged = true;
    }
    // Alleen opslaan als het resultaat nog steeds geldig is.
    const writeDraft = dChanged && parseSite(draft).ok;
    const writePublished = pChanged && !!published && parseSite(published).ok;

    const updated = writeDraft || writePublished
      ? await sql`
          update aitd_site set
            draft = case when ${writeDraft} then ${JSON.stringify(draft)}::jsonb else draft end,
            published = case when ${writePublished} then ${JSON.stringify(published)}::jsonb else published end,
            published_at = case when ${writePublished} then now() else published_at end,
            published_by = case when ${writePublished} then 'webdiscovery' else published_by end,
            updated_at = now(),
            updated_by = 'webdiscovery',
            rev = rev + 1
          where id = 1 and rev = ${rows[0].rev as number}
          returning id`
      : [{ id: 1 }];
    if (!updated[0]) continue; // tegelijk gewijzigd: opnieuw lezen en proberen

    for (const m of pending) await sql`insert into aitd_content_migrations (id) values (${m.id}) on conflict (id) do nothing`;
    if (writePublished) {
      const note = `Update: ${pending.map((m) => m.id).join(', ')}`;
      await sql`insert into aitd_versions (doc, note, created_by) values (${JSON.stringify(published)}::jsonb, ${note}, 'webdiscovery')`;
    }
    if (writeDraft || writePublished) {
      await audit('webdiscovery', 'inhoud bijgewerkt', { updates: pending.map((m) => m.id) });
    }
    return writeDraft || writePublished;
  }
  return false;
}

// Gepubliceerde versie voor bezoekers. Valt terug op de standaardinhoud als
// er (nog) geen database is of er iets misgaat — de site blijft dus altijd online.
export async function getPublishedSite(): Promise<SiteDoc> {
  return (await getPublishedInfo()).site;
}

export type PublishedInfo = { site: SiteDoc; publishedAt: string | null; domainLiveAt: string | null };

export async function getPublishedInfo(): Promise<PublishedInfo> {
  if (!hasDb()) return { site: defaultSite(), publishedAt: null, domainLiveAt: null };
  try {
    const row = await getSiteRow();
    return { site: row.published ?? defaultSite(), publishedAt: row.publishedAt, domainLiveAt: row.domainLiveAt };
  } catch (e) {
    console.error('[aitd] published laden mislukt', e);
    return { site: defaultSite(), publishedAt: null, domainLiveAt: null };
  }
}

// Eerste bezoek via het eigen domein: vanaf dan is de site "live" (zoekmachines aan,
// demo-adres stuurt door). Eenmalig; daarna slaat deze functie het werk over.
let domainMarked = false;
export async function markDomainLive(): Promise<void> {
  if (domainMarked || !hasDb()) return;
  try {
    await ensureSchema();
    await getSql()`update aitd_site set domain_live_at = now() where id = 1 and domain_live_at is null`;
    domainMarked = true;
  } catch (e) {
    console.error('[aitd] domein markeren mislukt', e);
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
