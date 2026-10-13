import { redirect } from 'next/navigation';
import { hasDb } from '@/lib/db';
import { getEditor } from '@/lib/aitd/auth';
import { getSiteRow } from '@/lib/aitd/db';
import { Editor } from './editor/editor';

export const dynamic = 'force-dynamic';

// Editor van de AITD-site. Toegang: ingelogde klant of de WebDiscovery-beheerder.
export default async function BeheerPage() {
  if (!hasDb()) {
    return <p className="p-10 text-center text-sm text-slate-500">De database is niet gekoppeld.</p>;
  }
  const editor = await getEditor();
  if (!editor) redirect('/aitd/beheer/login');
  const row = await getSiteRow();

  return (
    <>
      <div className="flex min-h-screen items-center justify-center p-8 text-center lg:hidden">
        <div>
          <p className="text-lg font-bold text-[#0B2E52]">Gebruik een computer</p>
          <p className="mt-2 text-sm text-slate-500">De website bewerken werkt het best op een laptop of computer met een breed scherm.</p>
        </div>
      </div>
      <div className="hidden lg:block">
        <Editor
          initial={row.draft}
          rev={row.rev}
          role={editor.kind}
          userLabel={editor.label}
          locked={row.clientLocked}
          publishedAt={row.publishedAt}
          updatedAt={row.updatedAt}
        />
      </div>
    </>
  );
}
