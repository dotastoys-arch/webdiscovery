import { headers } from 'next/headers';
import { getSql, hasDb } from '@/lib/db';
import { siteContentSchema } from '@/lib/generate/schema';
import type { ModuleId } from '@/lib/modules';
import { PreviewSite } from '../preview/[slug]/preview-site';

export const dynamic = 'force-dynamic';

// Wordt door de middleware aangeroepen wanneer een klantdomein binnenkomt.
// We zoeken de gekoppelde, live-gezette site bij dit domein en tonen 'm.
export default async function LiveSitePage() {
  const host = (await headers()).get('host')?.split(':')[0].toLowerCase().replace(/^www\./, '') ?? '';

  if (!hasDb() || !host) {
    return <NotLive host={host} />;
  }

  const sql = getSql();
  const rows = await sql`
    select gs.content, gs.modules, gs.preview_slug
    from orders o
    join generated_sites gs on gs.id = o.site_id
    where lower(o.domain) = ${host} and o.status = 'delivered'
    order by o.updated_at desc
    limit 1`;
  const site = rows[0];
  if (!site) return <NotLive host={host} />;

  const parsed = siteContentSchema.safeParse(site.content);
  if (!parsed.success) return <NotLive host={host} />;

  return (
    <PreviewSite
      content={parsed.data}
      modules={(site.modules as ModuleId[]) ?? []}
      slug={(site.preview_slug as string) ?? ''}
      live
    />
  );
}

function NotLive({ host }: { host: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-8">
      <div className="text-center max-w-md">
        <h1 className="text-xl font-bold text-neutral-800">Deze website komt binnenkort online</h1>
        <p className="mt-2 text-sm text-neutral-500">
          {host ? `${host} is aangemeld` : 'Dit domein is aangemeld'} en wordt momenteel gekoppeld. Kom snel terug.
        </p>
        <p className="mt-6 text-xs text-neutral-400">Website door WebDiscovery</p>
      </div>
    </div>
  );
}
