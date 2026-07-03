import Link from 'next/link';
import { getSql } from '@/lib/db';
import { PageHeader, StatCard, Card, CardHeader, Table, Th, Td, StatusBadge, EmptyState } from './ui';
import { icons } from './icons';
import { euro } from '@/lib/config';
import type { Lead } from '@/types/db';

export const dynamic = 'force-dynamic';

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'net';
  if (s < 3600) return `${Math.floor(s / 60)}m geleden`;
  if (s < 86400) return `${Math.floor(s / 3600)}u geleden`;
  return `${Math.floor(s / 86400)}d geleden`;
}

const eventLabels: Record<string, { label: string; dot: string }> = {
  website_quote_request: { label: 'Nieuwe aanvraag via de site', dot: 'bg-emerald-500' },
  site_generated: { label: 'Concept-site gegenereerd', dot: 'bg-indigo-500' },
  preview_viewed: { label: 'Preview bekeken', dot: 'bg-violet-500' },
};

export default async function OverviewPage() {
  const sql = getSql();

  const [c] = (await sql`
    select
      (select count(*)::int from leads) as leads,
      (select count(*)::int from leads where has_website = false) as no_website,
      (select count(*)::int from leads where status in ('replied','interested')) as interested,
      (select count(*)::int from generated_sites) as sites,
      (select count(*)::int from orders) as orders,
      (select coalesce(sum(amount_cents),0)::int from orders where status='paid') as revenue,
      (select count(*)::int from leads where created_at >= current_date - interval '7 days') as new_week
  `) as { leads: number; no_website: number; interested: number; sites: number; orders: number; revenue: number; new_week: number }[];

  const activity = (await sql`
    select e.type, e.created_at, l.company_name
    from events e left join leads l on l.id = e.lead_id
    order by e.created_at desc limit 6
  `) as { type: string; created_at: string; company_name: string | null }[];

  const recent = (await sql`select * from leads order by created_at desc limit 6`) as unknown as Lead[];

  const cities = (await sql`
    select coalesce(city,'Onbekend') as city, count(*)::int as n
    from leads group by 1 order by n desc limit 5
  `) as { city: string; n: number }[];
  const maxCity = Math.max(1, ...cities.map((x) => x.n));

  return (
    <div>
      <PageHeader
        title="Command Center"
        subtitle="De stand van je pijplijn in één oogopslag."
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="Leads totaal" value={c.leads} icon={icons.leads} tint="indigo"
          trend={c.new_week ? { value: `${c.new_week} deze week`, up: true } : undefined} />
        <StatCard label="Zonder website" value={c.no_website} icon={icons.discovery} tint="sky" hint="beste prospects" />
        <StatCard label="Interesse" value={c.interested} icon={icons.spark} tint="amber" hint="reactie ontvangen" />
        <StatCard label="Sites gemaakt" value={c.sites} icon={icons.bag} tint="violet" />
        <StatCard label="Omzet" value={euro(c.revenue)} icon={icons.revenue} tint="green" />
      </div>

      {/* Activity + cities */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Live activiteit"
            action={<span className="flex items-center gap-1.5 text-xs text-emerald-600"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Live</span>}
          />
          <div className="px-5 pb-4">
            {activity.length === 0 ? (
              <p className="text-sm text-neutral-400 py-6 text-center">Nog geen activiteit.</p>
            ) : (
              <div className="divide-y divide-neutral-100">
                {activity.map((a, i) => {
                  const info = eventLabels[a.type] ?? { label: a.type, dot: 'bg-neutral-400' };
                  return (
                    <div key={i} className="flex items-center gap-3 py-2.5">
                      <span className={`w-2 h-2 rounded-full ${info.dot}`} />
                      <span className="text-sm text-neutral-700 flex-1">
                        {info.label}
                        {a.company_name && <span className="text-neutral-400"> · {a.company_name}</span>}
                      </span>
                      <span className="text-xs text-neutral-400">{timeAgo(a.created_at)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Leads per plaats" />
          <div className="px-5 pb-5 space-y-3">
            {cities.length === 0 ? (
              <p className="text-sm text-neutral-400 py-4 text-center">Nog geen data.</p>
            ) : (
              cities.map((x) => (
                <div key={x.city}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-700">{x.city}</span>
                    <span className="font-medium text-neutral-900">{x.n}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${(x.n / maxCity) * 100}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Recent leads */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-neutral-800">Nieuwste leads</h2>
        <Link href="/admin/leads" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">Bekijk alle</Link>
      </div>
      {recent.length === 0 ? (
        <EmptyState>Nog geen leads. Discovery vult deze lijst automatisch.</EmptyState>
      ) : (
        <Table
          head={
            <>
              <Th>Bedrijf</Th>
              <Th>Plaats</Th>
              <Th>Website</Th>
              <Th>Status</Th>
              <Th>Gevonden</Th>
            </>
          }
        >
          {recent.map((l) => (
            <tr key={l.id}>
              <Td>{l.company_name}</Td>
              <Td>{l.city ?? '—'}</Td>
              <Td>
                {l.has_website === false ? (
                  <span className="inline-flex rounded-full bg-red-50 text-red-600 px-2 py-0.5 text-xs font-medium">Geen website</span>
                ) : l.has_website ? 'ja' : '—'}
              </Td>
              <Td><StatusBadge status={l.status} /></Td>
              <Td>{timeAgo(l.created_at)}</Td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
