import { getSql } from '@/lib/db';
import { PageHeader, Table, Th, Td, StatusBadge, EmptyState } from '../ui';
import { formatDate } from '@/lib/config';
import type { Message } from '@/types/db';

export const dynamic = 'force-dynamic';

type Row = Message & { lead_company_name: string | null };

export default async function EmailsPage() {
  const sql = getSql();
  const messages = (await sql`
    select m.*, l.company_name as lead_company_name
    from messages m
    left join leads l on l.id = m.lead_id
    order by m.created_at desc
    limit 200
  `) as unknown as Row[];

  return (
    <div>
      <PageHeader
        title="Berichten"
        subtitle="Verzonden en ontvangen e-mails, inclusief opens en klikken."
      />
      {messages.length === 0 ? (
        <EmptyState>Nog geen berichten. De outreach-engine logt hier alles.</EmptyState>
      ) : (
        <Table
          head={
            <>
              <Th>Richting</Th>
              <Th>Bedrijf</Th>
              <Th>Onderwerp</Th>
              <Th>Stap</Th>
              <Th>Status</Th>
              <Th>Verzonden</Th>
            </>
          }
        >
          {messages.map((m) => (
            <tr key={m.id}>
              <Td>{m.direction === 'outbound' ? '→ uit' : '← in'}</Td>
              <Td>{m.lead_company_name ?? '—'}</Td>
              <Td>{m.subject ?? '—'}</Td>
              <Td>{m.step ?? '—'}</Td>
              <Td>
                <StatusBadge status={m.status} />
              </Td>
              <Td>{formatDate(m.sent_at ?? m.created_at)}</Td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
