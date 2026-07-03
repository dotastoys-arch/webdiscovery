import { createClient } from '@/lib/supabase/server';
import { PageHeader, Table, Th, Td, StatusBadge, EmptyState } from '../ui';
import { formatDate } from '@/lib/config';
import type { Campaign, EmailTemplate } from '@/types/db';

export const dynamic = 'force-dynamic';

export default async function CampaignsPage() {
  const supabase = await createClient();
  const [{ data: campaignData }, { data: templateData }] = await Promise.all([
    supabase.from('campaigns').select('*').order('created_at', { ascending: false }),
    supabase.from('email_templates').select('*').order('step'),
  ]);
  const campaigns = (campaignData ?? []) as Campaign[];
  const templates = (templateData ?? []) as EmailTemplate[];

  return (
    <div>
      <PageHeader title="Campagnes" subtitle="Outreach-campagnes en de mail-sjablonen per stap." />

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
        <EmptyState>Geen sjablonen gevonden — draai de seed-migratie (0002_seed.sql).</EmptyState>
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
