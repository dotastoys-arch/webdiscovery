import { createClient } from '@/lib/supabase/server';
import { PageHeader, Table, Th, Td, StatusBadge, EmptyState } from '../ui';
import { formatDate } from '@/lib/config';
import type { Message, Lead } from '@/types/db';

export const dynamic = 'force-dynamic';

type Row = Message & { leads: Pick<Lead, 'company_name'> | null };

export default async function EmailsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('messages')
    .select('*, leads(company_name)')
    .order('created_at', { ascending: false })
    .limit(200);
  const messages = (data ?? []) as Row[];

  return (
    <div>
      <PageHeader
        title="Berichten"
        subtitle="Verzonden en ontvangen e-mails, inclusief opens en klikken (fase 2)."
      />
      {messages.length === 0 ? (
        <EmptyState>Nog geen berichten. De outreach-engine (fase 2) logt hier alles.</EmptyState>
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
              <Td>{m.leads?.company_name ?? '—'}</Td>
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
