import Link from 'next/link';
import { getSql } from '@/lib/db';
import { PageHeader, Table, Th, Td, StatusBadge, EmptyState } from '../ui';
import { GenerateButton } from './generate-button';
import type { Lead } from '@/types/db';

export const dynamic = 'force-dynamic';

type LeadRow = Lead & { preview_url: string | null };

const filters = [
  { key: 'all', label: 'Alle' },
  { key: 'emailable', label: 'Met e-mail' },
  { key: 'no-website', label: 'Zonder website' },
  { key: 'has-website', label: 'Met website' },
];

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter = 'all' } = await searchParams;
  const sql = getSql();
  const rows = (await sql`
    select l.*, gs.preview_url
    from leads l
    left join lateral (
      select preview_url from generated_sites
      where lead_id = l.id order by created_at desc limit 1
    ) gs on true
    where (${filter} = 'all')
       or (${filter} = 'no-website' and l.has_website = false)
       or (${filter} = 'has-website' and l.has_website = true)
       or (${filter} = 'emailable' and l.email is not null)
    order by l.score desc nulls last, l.created_at desc
    limit 200
  `) as unknown as LeadRow[];

  return (
    <div>
      <PageHeader
        title="Leads"
        subtitle="Gesorteerd op score (beste e-mailprospect eerst). Genereer een concept-site per lead."
      />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex gap-1.5">
          {filters.map((f) => (
            <Link
              key={f.key}
              href={f.key === 'all' ? '/admin/leads' : `/admin/leads?filter=${f.key}`}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                filter === f.key ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
        <a
          href="/api/admin/leads/export"
          className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50"
        >
          ↓ Exporteer CSV
        </a>
      </div>

      {rows.length === 0 ? (
        <EmptyState>Geen leads in deze weergave. Gebruik Discovery om ze te vinden of te importeren.</EmptyState>
      ) : (
        <Table
          head={
            <>
              <Th>Bedrijf</Th>
              <Th>E-mail</Th>
              <Th>Plaats</Th>
              <Th>Rating</Th>
              <Th>Website</Th>
              <Th>Score</Th>
              <Th>Status</Th>
              <Th>Site</Th>
            </>
          }
        >
          {rows.map((l) => (
            <tr key={l.id}>
              <Td>{l.company_name}</Td>
              <Td>{l.email ?? '—'}</Td>
              <Td>{l.city ?? '—'}</Td>
              <Td>{l.rating != null ? `${Number(l.rating).toFixed(1)}★` : '—'}</Td>
              <Td>
                {l.has_website === false ? (
                  <span className="inline-block rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs font-medium">
                    Geen website
                  </span>
                ) : l.has_website === true ? (
                  <span className="text-neutral-500 text-xs">Website</span>
                ) : (
                  '?'
                )}
              </Td>
              <Td>{l.score ?? '—'}</Td>
              <Td>
                <StatusBadge status={l.status} />
              </Td>
              <Td>
                <GenerateButton leadId={l.id} initialPreviewUrl={l.preview_url} />
              </Td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
