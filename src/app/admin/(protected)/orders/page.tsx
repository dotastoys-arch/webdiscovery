import Link from 'next/link';
import { getSql } from '@/lib/db';
import { PageHeader, Table, Th, Td, StatusBadge, EmptyState } from '../ui';
import { formatDate, euro } from '@/lib/config';
import { OrderControls } from './order-controls';
import { DeleteOrderButton } from './delete-order-button';
import type { Order } from '@/types/db';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const sql = getSql();
  const orders = (await sql`select * from orders order by created_at desc limit 200`) as unknown as Order[];

  return (
    <div>
      <PageHeader title="Bestellingen" subtitle="€500-opdrachten, betaling (Mollie), domein koppelen en live zetten." />
      {orders.length === 0 ? (
        <EmptyState>Nog geen bestellingen. Maak er een via Websites → Betaallink.</EmptyState>
      ) : (
        <Table
          head={
            <>
              <Th>Bedrijf</Th>
              <Th>Bedrag</Th>
              <Th>Status</Th>
              <Th>Domein &amp; live</Th>
              <Th>Aangemaakt</Th>
              <Th> </Th>
            </>
          }
        >
          {orders.map((o) => (
            <tr key={o.id}>
              <Td>
                <Link href={`/admin/orders/${o.id}`} className="font-medium text-indigo-600 hover:underline">
                  {o.customer_company ?? o.customer_email ?? '—'}
                </Link>
              </Td>
              <Td>{euro(o.amount_cents)}</Td>
              <Td>
                <StatusBadge status={o.status} />
              </Td>
              <Td>
                <OrderControls id={o.id} status={o.status} domain={o.domain} />
              </Td>
              <Td>{formatDate(o.created_at)}</Td>
              <Td>
                <DeleteOrderButton id={o.id} label={o.customer_company ?? o.customer_email ?? 'deze klant'} />
              </Td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
