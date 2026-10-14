import { hasDb } from '@/lib/db';
import { getSiteRow } from '@/lib/aitd/db';
import { PageHeader, EmptyState } from '../ui';
import { AitdAdmin } from './aitd-admin';

export const dynamic = 'force-dynamic';

// Beheerpaneel voor het AITD-klantportaal — alleen bereikbaar voor de WebDiscovery-admin.
export default async function AitdAdminPage() {
  if (!hasDb()) return <EmptyState>Koppel eerst de database (DATABASE_URL).</EmptyState>;
  const row = await getSiteRow();
  return (
    <div>
      <PageHeader
        title="AITD-portaal"
        subtitle="Klantaccounts, versies en controle over de website van AITD Consulting."
      />
      <AitdAdmin locked={row.clientLocked} publishedAt={row.publishedAt} publishedBy={row.publishedBy} updatedBy={row.updatedBy} domainLiveAt={row.domainLiveAt} />
    </div>
  );
}
