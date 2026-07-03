import { PageHeader } from '../ui';
import { DiscoveryForm } from './discovery-form';

export const dynamic = 'force-dynamic';

export default function DiscoveryPage() {
  return (
    <div>
      <PageHeader
        title="Discovery"
        subtitle="Vind bedrijven via Google Places of importeer handmatig. Ze worden verrijkt (e-mail, verouderde site) en als leads opgeslagen."
      />
      <DiscoveryForm />
    </div>
  );
}
