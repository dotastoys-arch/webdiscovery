import { createClient } from '@/lib/supabase/server';
import { PageHeader, Table, Th, Td, StatusBadge, EmptyState } from '../ui';
import { formatDate } from '@/lib/config';
import { GenerateButton } from './generate-button';
import type { Lead } from '@/types/db';

export const dynamic = 'force-dynamic';

type LeadRow = Lead & { generated_sites: { preview_url: string | null }[] };

export default async function LeadsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('leads')
    .select('*, generated_sites(preview_url)')
    .order('score', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(200);
  const leads = (data ?? []) as LeadRow[];

  return (
    <div>
      <PageHeader
        title="Leads"
        subtitle="Gesorteerd op score (beste e-mailprospect eerst). Genereer een concept-site per lead."
      />
      {leads.length === 0 ? (
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
          {leads.map((l) => (
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
                <GenerateButton leadId={l.id} initialPreviewUrl={l.generated_sites?.[0]?.preview_url} />
              </Td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
