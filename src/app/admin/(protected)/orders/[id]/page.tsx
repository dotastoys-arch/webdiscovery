import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSql } from '@/lib/db';
import { hasVercel } from '@/lib/vercel';
import { config, euro, formatDate } from '@/lib/config';
import { PageHeader, StatusBadge } from '../../ui';
import { DomainSection } from '../../websites/[id]/domain-section';
import { CopyField } from './copy-field';
import type { Order } from '@/types/db';

export const dynamic = 'force-dynamic';

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sql = getSql();
  const rows = await sql`
    select o.*, gs.preview_url from orders o
    left join generated_sites gs on gs.id = o.site_id
    where o.id = ${id} limit 1`;
  const order = rows[0] as (Order & { preview_url: string | null }) | undefined;
  if (!order) notFound();

  const bestelUrl = `${config.siteUrl}/bestel/${order.id}`;
  const isPaid = ['paid', 'domain_setup', 'delivered'].includes(order.status);

  return (
    <div>
      <div className="mb-4">
        <Link href="/admin/orders" className="text-sm text-neutral-500 hover:text-neutral-800">← Bestellingen</Link>
      </div>
      <PageHeader
        title={order.customer_company ?? order.customer_email ?? 'Bestelling'}
        subtitle="De betaalomgeving van deze klant — betaling, domein koppelen en live zetten."
      />

      <div className="max-w-2xl space-y-6">
        {/* Overzicht */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Bestelling</h2>
            <StatusBadge status={order.status} />
          </div>
          <div className="flex justify-between py-2 border-b border-neutral-100 text-sm">
            <span className="text-neutral-600">Complete website (eenmalig)</span>
            <span className="font-semibold">{euro(order.amount_cents)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-neutral-100 text-sm">
            <span className="text-neutral-600">Domeinnaam, hosting &amp; onderhoud</span>
            <span className="font-semibold">{euro(order.monthly_cents)}/mnd</span>
          </div>
          <div className="flex justify-between py-2 text-sm">
            <span className="text-neutral-600">Aangemaakt</span>
            <span className="text-neutral-500">{formatDate(order.created_at)}</span>
          </div>
          {order.preview_url && (
            <a href={order.preview_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700">
              Bekijk de website ↗
            </a>
          )}
        </div>

        {/* Betaallink om te delen met de klant — alleen zolang nog niet betaald */}
        {!isPaid && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="text-lg font-bold">Betaallink</h2>
            <p className="text-sm text-neutral-500 mt-0.5 mb-4">Stuur deze link naar de klant om te betalen (iDEAL via Mollie).</p>
            <CopyField value={bestelUrl} />
          </div>
        )}

        {/* Domein koppelen & live zetten (3 stappen) */}
        <DomainSection siteId={order.site_id ?? ''} order={{ id: order.id, status: order.status, domain: order.domain }} canAutoRegister={hasVercel()} />
      </div>
    </div>
  );
}
