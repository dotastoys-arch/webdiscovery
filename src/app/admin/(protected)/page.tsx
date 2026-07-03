import { getSql } from '@/lib/db';
import { PageHeader, StatCard, Table, Th, Td, StatusBadge, EmptyState } from './ui';
import { formatDate, euro } from '@/lib/config';
import type { Lead } from '@/types/db';

export const dynamic = 'force-dynamic';

export default async function OverviewPage() {
  const sql = getSql();

  const [leadsC, noWebC, interestedC, ordersC, paid, recentRows] = await Promise.all([
    sql`select count(*)::int as c from leads`,
    sql`select count(*)::int as c from leads where has_website = false`,
    sql`select count(*)::int as c from leads where status in ('replied','interested')`,
    sql`select count(*)::int as c from orders`,
    sql`select coalesce(sum(amount_cents),0)::int as c from orders where status = 'paid'`,
    sql`select * from leads order by created_at desc limit 8`,
  ]);

  const revenue = paid[0].c as number;
  const recent = recentRows as unknown as Lead[];

  return (
    <div>
      <PageHeader title="Overzicht" subtitle="De stand van de pijplijn in één oogopslag." />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Leads totaal" value={leadsC[0].c} />
        <StatCard label="Zonder website" value={noWebC[0].c} hint="beste prospects" />
        <StatCard label="Interesse" value={interestedC[0].c} hint="reactie ontvangen" />
        <StatCard label="Bestellingen" value={ordersC[0].c} />
        <StatCard label="Omzet (betaald)" value={euro(revenue)} />
      </div>

      <h2 className="text-sm font-medium text-neutral-500 mb-3">Nieuwste leads</h2>
      {recent.length === 0 ? (
        <EmptyState>
          Nog geen leads. Gebruik Discovery om ze te vinden of te importeren.
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
