import { getSql } from '@/lib/db';
import { PageHeader, Table, Th, Td, StatusBadge, EmptyState } from '../ui';
import { formatDate } from '@/lib/config';
import { OutreachButton } from './outreach-button';
import { TemplateEditor } from './template-editor';
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

      <h2 className="text-sm font-medium text-neutral-500 mb-1 mt-8">Mail-sjablonen</h2>
      <p className="text-xs text-neutral-400 mb-3">Klik op een sjabloon om het onderwerp en de tekst te bewerken.</p>
      {templates.length === 0 ? (
        <EmptyState>Geen sjablonen gevonden — draai de database-setup (setup.sql).</EmptyState>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => (
            <TemplateEditor key={t.id} template={t} />
          ))}
        </div>
      )}
    </div>
  );
}
