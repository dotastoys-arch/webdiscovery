import { getSql } from '@/lib/db';
import { PageHeader, Table, Th, Td, StatusBadge, EmptyState } from '../ui';
import { GenerateButton } from './generate-button';
import type { Lead } from '@/types/db';

export const dynamic = 'force-dynamic';

type LeadRow = Lead & { preview_url: string | null };

export default async function LeadsPage() {
  const sql = getSql();
  const rows = (await sql`
    select l.*, gs.preview_url
    from leads l
    left join lateral (
      select preview_url from generated_sites
      where lead_id = l.id order by created_at desc limit 1
    ) gs on true
    order by l.score desc nulls last, l.created_at desc
    limit 200
  `) as unknown as LeadRow[];

  return (
    <div>
      <PageHeader
        title="Leads"
        subtitle="Gesorteerd op score (beste e-mailprospect eerst). Genereer een concept-site per lead."
      />
      {rows.length === 0 ? (
        <EmptyState>Nog geen leads. Gebruik Discovery om ze te vinden of te importeren.</EmptyState>
      ) : (
        <Table
          head={
            <>
              <Th>Bedrijf</Th>
              <Th>E-mail</Th>
              <Th>Plaats</Th>
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
              <Td>{l.has_website === null ? '?' : l.has_website ? 'ja' : 'nee'}</Td>
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
