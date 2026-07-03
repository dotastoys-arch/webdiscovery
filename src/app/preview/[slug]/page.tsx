import { notFound } from 'next/navigation';
import { getSql, hasDb } from '@/lib/db';
import { siteContentSchema } from '@/lib/generate/schema';
import type { ModuleId } from '@/lib/modules';
import { PreviewSite } from './preview-site';
import { ViewTracker } from './view-tracker';

export const dynamic = 'force-dynamic';

export default async function PreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (!hasDb()) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-neutral-500 p-8 text-center">
        Preview vereist een gekoppelde database.
      </div>
    );
  }

  const sql = getSql();
  const rows = await sql`select * from generated_sites where preview_slug = ${slug} limit 1`;
  const site = rows[0];
  if (!site) notFound();

  const parsed = siteContentSchema.safeParse(site.content);
  if (!parsed.success) notFound();

  // Al betaald? Dan geen "bestellen"-balk meer tonen.
  const paidRows = await sql`
    select 1 from orders where site_id = ${site.id} and status in ('paid','domain_setup','delivered') limit 1`;
  const paid = !!paidRows[0];

  return (
    <>
      <ViewTracker slug={slug} />
      <PreviewSite content={parsed.data} modules={(site.modules as ModuleId[]) ?? []} slug={slug} live={paid} />
    </>
  );
}
