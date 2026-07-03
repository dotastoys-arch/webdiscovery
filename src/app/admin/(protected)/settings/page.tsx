import { createClient } from '@/lib/supabase/server';
import { PageHeader, EmptyState } from '../ui';
import type { CompanyProfile } from '@/types/db';

export const dynamic = 'force-dynamic';

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between py-2 border-b border-neutral-100 text-sm">
      <span className="text-neutral-500">{label}</span>
      <span className="font-medium">{value || '—'}</span>
    </div>
  );
}

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from('company_profile').select('*').limit(1).single();
  const p = data as CompanyProfile | null;

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Instellingen"
        subtitle="Je bedrijfsgegevens — verschijnen in mailfooters (KvK = vertrouwen)."
      />
      {!p ? (
        <EmptyState>Geen bedrijfsprofiel gevonden — draai de seed-migratie (0002_seed.sql).</EmptyState>
      ) : (
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <Field label="Naam" value={p.name} />
          <Field label="Juridische naam" value={p.legal_name} />
          <Field label="KvK-nummer" value={p.kvk_number} />
          <Field label="BTW-nummer" value={p.vat_number} />
          <Field label="Adres" value={p.address} />
          <Field label="Postcode" value={p.postal_code} />
          <Field label="Plaats" value={p.city} />
          <Field label="E-mail" value={p.email} />
          <Field label="Telefoon" value={p.phone} />
          <Field label="Afzendernaam" value={p.sender_name} />
          <Field label="Verzendadres" value={p.sender_email} />
          <p className="text-xs text-neutral-400 mt-4">
            Aanpassen kan nu direct in Supabase (tabel <code>company_profile</code>). Een
            bewerk-formulier komt in een latere fase.
          </p>
        </div>
      )}
    </div>
  );
}
