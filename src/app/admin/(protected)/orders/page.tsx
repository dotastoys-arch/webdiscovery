import { createClient } from '@/lib/supabase/server';
import { PageHeader, Table, Th, Td, StatusBadge, EmptyState } from '../ui';
import { formatDate, euro } from '@/lib/config';
import type { Order } from '@/types/db';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  const orders = (data ?? []) as Order[];

  return (
    <div>
      <PageHeader title="Bestellingen" subtitle="€500-opdrachten, betaling (Mollie) en oplevering." />
      {orders.length === 0 ? (
        <EmptyState>Nog geen bestellingen. Deze komen binnen via de bestelflow (fase 4).</EmptyState>
      ) : (
        <Table
          head={
            <>
              <Th>Klant</Th>
              <Th>Bedrijf</Th>
              <Th>Domein</Th>
              <Th>Bedrag</Th>
              <Th>Status</Th>
              <Th>Aangemaakt</Th>
            </>
          }
        >
          {orders.map((o) => (
            <tr key={o.id}>
              <Td>{o.customer_name ?? o.customer_email ?? '—'}</Td>
              <Td>{o.customer_company ?? '—'}</Td>
              <Td>{o.domain ?? '—'}</Td>
              <Td>{euro(o.amount_cents)}</Td>
              <Td>
                <StatusBadge status={o.status} />
              </Td>
              <Td>{formatDate(o.created_at)}</Td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
