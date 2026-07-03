import { getSql } from '@/lib/db';
import { PageHeader, Table, Th, Td, StatusBadge, EmptyState } from '../ui';
import { formatDate } from '@/lib/config';
import { OutreachButton } from './outreach-button';
import type { Campaign, EmailTemplate } from '@/types/db';

export const dynamic = 'force-dynamic';

export default async function CampaignsPage() {
  const sql = getSql();
  const [campaigns, templates] = (await Promise.all([
    sql`select * from campaigns order by created_at desc`,
    sql`select * from email_templates order by step`,
  ])) as unknown as [Campaign[], EmailTemplate[]];

  return (
    <div>
      <PageHeader title="Campagnes" subtitle="Outreach-campagnes en de mail-sjablonen per stap." />

      <OutreachButton />

      <h2 className="text-sm font-medium text-neutral-500 mb-3">Campagnes</h2>
      {campaigns.length === 0 ? (
        <EmptyState>Nog geen campagnes. Aanmaken kan zodra de outreach-engine live is (fase 2).</EmptyState>
      ) : (
        <Table
          head={
            <>
              <Th>Naam</Th>
              <Th>Status</Th>
              <Th>Limiet/dag</Th>
              <Th>Aangemaakt</Th>
            </>
          }
        >
          {campaigns.map((c) => (
            <tr key={c.id}>
              <Td>{c.name}</Td>
              <Td>
                <StatusBadge status={c.status} />
              </Td>
              <Td>{c.daily_send_limit}</Td>
              <Td>{formatDate(c.created_at)}</Td>
            </tr>
          ))}
        </Table>
      )}

      <h2 className="text-sm font-medium text-neutral-500 mb-3 mt-8">Mail-sjablonen</h2>
      {templates.length === 0 ? (
        <EmptyState>Geen sjablonen gevonden — draai de database-setup (setup.sql).</EmptyState>
      ) : (
        <Table
          head={
            <>
              <Th>Stap</Th>
              <Th>Naam</Th>
              <Th>Onderwerp</Th>
              <Th>Actief</Th>
            </>
          }
        >
          {templates.map((t) => (
            <tr key={t.id}>
              <Td>{t.step}</Td>
              <Td>{t.name}</Td>
              <Td>{t.subject}</Td>
              <Td>{t.is_active ? 'ja' : 'nee'}</Td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
