import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSql } from '@/lib/db';
import { siteContentSchema } from '@/lib/generate/schema';
import { PageHeader } from '../../ui';
import { EditForm } from './edit-form';

export const dynamic = 'force-dynamic';

export default async function EditWebsitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sql = getSql();
  const rows = await sql`
    select gs.*, l.company_name from generated_sites gs
    left join leads l on l.id = gs.lead_id where gs.id = ${id} limit 1`;
  const site = rows[0];
  if (!site) notFound();

  const parsed = siteContentSchema.safeParse(site.content);
  if (!parsed.success) notFound();
  const c = parsed.data;

  return (
    <div>
      <div className="mb-4">
        <Link href="/admin/websites" className="text-sm text-neutral-500 hover:text-neutral-800">← Websites</Link>
      </div>
      <PageHeader
        title={`Website — ${site.company_name ?? 'onbekend'}`}
        subtitle="Pas de teksten en kleur aan. Wijzigingen zijn direct zichtbaar op de preview."
      />
      <EditForm
        siteId={id}
        previewUrl={site.preview_url as string | null}
        initial={{
          tagline: c.brand.tagline,
          accent: c.theme.accent,
          headline: c.hero.headline,
          subheadline: c.hero.subheadline,
          ctaLabel: c.hero.ctaLabel,
          aboutTitle: c.about.title,
          aboutBody: c.about.body,
        }}
      />
    </div>
  );
}
