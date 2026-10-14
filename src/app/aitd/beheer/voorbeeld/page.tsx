import { redirect } from 'next/navigation';
import { hasDb } from '@/lib/db';
import { getEditor } from '@/lib/aitd/auth';
import { getSiteRow } from '@/lib/aitd/db';
import { aitdBase } from '@/lib/aitd/host';
import { SiteView } from '../../_site/render';

export const dynamic = 'force-dynamic';

// Voorbeeld van het opgeslagen concept (alleen voor ingelogde beheerders).
export default async function VoorbeeldPage({ searchParams }: { searchParams: Promise<{ pagina?: string }> }) {
  const base = await aitdBase();
  if (!hasDb()) redirect(base || '/');
  if (!(await getEditor())) redirect(`${base}/beheer/login`);
  const { pagina = '' } = await searchParams;
  const { draft } = await getSiteRow();
  const pages = draft.layout === 'one_page' ? draft.pages.slice(0, 1) : draft.pages;
  const page = pages.find((p) => p.slug === pagina) ?? pages[0];
  return (
    <>
      <div className="bg-amber-400 px-4 py-2 text-center text-sm font-semibold text-amber-950">
        Voorbeeld van het concept — bezoekers zien dit pas na “Publiceren”. Links in dit voorbeeld gaan naar de live site.
      </div>
      <SiteView ctx={{ site: draft, page, base }} />
    </>
  );
}
