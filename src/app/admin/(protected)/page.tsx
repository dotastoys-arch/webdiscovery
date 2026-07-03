import { createClient } from '@/lib/supabase/server';
import { PageHeader, StatCard, Table, Th, Td, StatusBadge, EmptyState } from './ui';
import { formatDate, euro } from '@/lib/config';
import type { Lead } from '@/types/db';

export const dynamic = 'force-dynamic';

async function count(table: string, filter?: (q: any) => any) {
  const supabase = await createClient();
  let q = supabase.from(table).select('*', { count: 'exact', head: true });
  if (filter) q = filter(q);
  const { count } = await q;
  return count ?? 0;
}

export default async function OverviewPage() {
  const supabase = await createClient();

  const [leads, noWebsite, interested, orders, paidRes, recentRes] = await Promise.all([
    count('leads'),
    count('leads', (q) => q.eq('has_website', false)),
    count('leads', (q) => q.in('status', ['replied', 'interested'])),
    count('orders'),
    supabase.from('orders').select('amount_cents').eq('status', 'paid'),
    supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(8),
  ]);

  const revenue = (paidRes.data ?? []).reduce((s, o) => s + (o.amount_cents ?? 0), 0);
  const recent = (recentRes.data ?? []) as Lead[];

  return (
    <div>
      <PageHeader title="Overzicht" subtitle="De stand van de pijplijn in één oogopslag." />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Leads totaal" value={leads} />
        <StatCard label="Zonder website" value={noWebsite} hint="beste prospects" />
        <StatCard label="Interesse" value={interested} hint="reactie ontvangen" />
        <StatCard label="Bestellingen" value={orders} />
        <StatCard label="Omzet (betaald)" value={euro(revenue)} />
      </div>

      <h2 className="text-sm font-medium text-neutral-500 mb-3">Nieuwste leads</h2>
      {recent.length === 0 ? (
        <EmptyState>
          Nog geen leads. De discovery-tool (fase 2) vult deze lijst automatisch — of importeer
          handmatig via Leads.
        </EmptyState>
      ) : (
        <Table
          head={
            <>
              <Th>Bedrijf</Th>
              <Th>Plaats</Th>
              <Th>Website</Th>
              <Th>Status</Th>
              <Th>Gevonden</Th>
            </>
          }
        >
          {recent.map((l) => (
            <tr key={l.id}>
              <Td>{l.company_name}</Td>
              <Td>{l.city ?? '—'}</Td>
              <Td>{l.has_website ? 'ja' : 'nee'}</Td>
              <Td>
                <StatusBadge status={l.status} />
              </Td>
              <Td>{formatDate(l.created_at)}</Td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
