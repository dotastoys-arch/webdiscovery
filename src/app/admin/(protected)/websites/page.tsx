import { getSql } from '@/lib/db';
import { PageHeader, Table, Th, Td, StatusBadge, EmptyState } from '../ui';
import { formatDate } from '@/lib/config';
import { WebsiteActions } from './website-actions';

export const dynamic = 'force-dynamic';

type Row = {
  id: string;
  status: string;
  preview_url: string | null;
  view_count: number;
  updated_at: string;
  company_name: string | null;
};

export default async function WebsitesPage() {
  const sql = getSql();
  const rows = (await sql`
    select gs.id, gs.status, gs.preview_url, gs.view_count, gs.updated_at, l.company_name
    from generated_sites gs left join leads l on l.id = gs.lead_id
    order by gs.updated_at desc limit 200
  `) as unknown as Row[];

  return (
    <div>
      <PageHeader
        title="Websites"
        subtitle="De gegenereerde concept-sites. Bewerk ze, deel de preview of maak een betaallink."
      />
      {rows.length === 0 ? (
        <EmptyState>Nog geen websites. Genereer er een bij een lead (Leads → Genereer site).</EmptyState>
      ) : (
        <Table
          head={
            <>
              <Th>Bedrijf</Th>
              <Th>Status</Th>
              <Th>Bekeken</Th>
              <Th>Bijgewerkt</Th>
              <Th>Acties</Th>
            </>
          }
        >
          {rows.map((r) => (
            <tr key={r.id}>
              <Td>{r.company_name ?? '—'}</Td>
              <Td><StatusBadge status={r.status} /></Td>
              <Td>{r.view_count > 0 ? `${r.view_count}×` : '—'}</Td>
              <Td>{formatDate(r.updated_at)}</Td>
              <Td><WebsiteActions siteId={r.id} previewUrl={r.preview_url} /></Td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
