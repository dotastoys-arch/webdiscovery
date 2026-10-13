'use client';

import { useCallback, useEffect, useState } from 'react';
import type { SiteDoc } from '@/lib/aitd/types';
import { AitdMark } from '../../logo';
import { EditorProvider, useEditor } from './state';
import { Canvas } from './canvas';
import { BlockForm } from './block-form';
import { Palette, PagesPanel, SettingsPanel } from './side-panels';
import { PasswordDialog } from './password-dialog';

type Props = {
  initial: SiteDoc;
  rev: number;
  role: 'admin' | 'client';
  userLabel: string;
  locked: boolean;
  publishedAt: string | null;
  updatedAt: string;
  base: string;
};

type Status = { kind: 'idle' | 'saving' | 'saved' | 'error' | 'publishing' | 'published'; text?: string };

export function Editor(props: Props) {
  const [dirty, setDirty] = useState(false);
  const markDirty = useCallback(() => setDirty(true), []);
  const readOnly = props.locked && props.role === 'client';
  return (
    <EditorProvider initial={props.initial} readOnly={readOnly} onChange={markDirty}>
      <Shell {...props} dirty={dirty} setDirty={setDirty} readOnly={readOnly} />
    </EditorProvider>
  );
}

function Shell({
  base,
  rev: initialRev,
  role,
  userLabel,
  locked,
  publishedAt,
  dirty,
  setDirty,
  readOnly,
}: Props & { dirty: boolean; setDirty: (v: boolean) => void; readOnly: boolean }) {
  const { doc, undo, redo, canUndo, canRedo, selected, select, page, pageIndex, setPageIndex } = useEditor();
  const [rev, setRev] = useState(initialRev);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [tab, setTab] = useState<'blocks' | 'pages' | 'settings'>('blocks');
  const [lastPublished, setLastPublished] = useState(publishedAt);
  const [menu, setMenu] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const save = useCallback(async (): Promise<number | null> => {
    setStatus({ kind: 'saving' });
    const res = await fetch('/api/aitd/site', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ doc, rev }),
    }).catch(() => null);
    const j = res ? await res.json().catch(() => ({})) : {};
    if (!res?.ok) {
      setStatus({ kind: 'error', text: j.error ?? 'Opslaan mislukt. Controleer je internetverbinding.' });
      return null;
    }
    setRev(j.rev);
    setDirty(false);
    setStatus({ kind: 'saved', text: 'Concept opgeslagen' });
    return j.rev as number;
  }, [doc, rev, setDirty]);

  async function publish() {
    if (!confirm('De website live zetten? Bezoekers zien direct de nieuwe versie.')) return;
    let currentRev: number | null = rev;
    if (dirty) currentRev = await save();
    if (currentRev === null) return;
    setStatus({ kind: 'publishing' });
    const res = await fetch('/api/aitd/site/publish', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ rev: currentRev }),
    }).catch(() => null);
    const j = res ? await res.json().catch(() => ({})) : {};
    if (!res?.ok) return setStatus({ kind: 'error', text: j.error ?? 'Publiceren mislukt.' });
    setLastPublished(new Date().toISOString());
    setStatus({ kind: 'published', text: 'Gepubliceerd — de website is bijgewerkt' });
  }

  async function logout() {
    if (dirty && !confirm('Je hebt wijzigingen die nog niet zijn opgeslagen. Toch uitloggen?')) return;
    if (role === 'admin') {
      window.location.href = '/admin/aitd';
      return;
    }
    await fetch('/api/aitd/auth/logout', { method: 'POST' });
    window.location.href = `${base}/beheer/login`;
  }

  // Ctrl/Cmd+S = opslaan, Ctrl/Cmd+Z = ongedaan maken.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const inField = (e.target as HTMLElement)?.closest('input, textarea');
      if (e.key === 's') {
        e.preventDefault();
        if (!readOnly) save();
      } else if (e.key === 'z' && !inField) {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [save, undo, redo, readOnly]);

  // Waarschuwen bij weggaan met niet-opgeslagen wijzigingen.
  useEffect(() => {
    const onUnload = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [dirty]);

  // Statusmelding na een paar seconden laten verdwijnen.
  useEffect(() => {
    if (status.kind === 'saved' || status.kind === 'published') {
      const t = setTimeout(() => setStatus({ kind: 'idle' }), 4000);
      return () => clearTimeout(t);
    }
  }, [status]);

  const pageUrl = `${base}${page.slug && doc.layout === 'multi_page' ? `/${page.slug}` : ''}` || '/';

  return (
    <div className="flex h-screen flex-col bg-slate-100 text-slate-800">
      {/* Bovenbalk */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4">
        <AitdMark className="h-5 w-auto" />
        <span className="hidden text-sm font-semibold text-slate-500 lg:inline">Websitebeheer</span>
        {role === 'admin' && (
          <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-800">
            Beheerder
          </span>
        )}

        <div className="ml-2 flex items-center gap-1">
          <TopBtn title="Ongedaan maken (Ctrl+Z)" disabled={!canUndo || readOnly} onClick={undo}>↶</TopBtn>
          <TopBtn title="Opnieuw (Ctrl+Shift+Z)" disabled={!canRedo || readOnly} onClick={redo}>↷</TopBtn>
        </div>

        {doc.layout === 'multi_page' && (
          <select
            value={pageIndex}
            onChange={(e) => setPageIndex(Number(e.target.value))}
            className="ml-2 max-w-48 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
            title="Welke pagina bewerk je?"
          >
            {doc.pages.map((p, i) => (
              <option key={p.id} value={i}>
                {p.title}
              </option>
            ))}
          </select>
        )}

        <div className="ml-auto flex items-center gap-3">
          <StatusText status={status} dirty={dirty} lastPublished={lastPublished} />
          <a
            href={`${base}/beheer/voorbeeld?pagina=${encodeURIComponent(page.slug)}`}
            target="_blank"
            rel="noopener"
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 md:inline"
            title="Bekijk het opgeslagen concept zoals bezoekers het zouden zien"
          >
            Voorbeeld
          </a>
          <a
            href={pageUrl}
            target="_blank"
            rel="noopener"
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 xl:inline"
          >
            Live site ↗
          </a>
          <button
            type="button"
            disabled={readOnly || status.kind === 'saving'}
            onClick={() => save()}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
          >
            Opslaan
          </button>
          <button
            type="button"
            disabled={readOnly || status.kind === 'publishing'}
            onClick={publish}
            className="rounded-md bg-[#0B2E52] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            Publiceren
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenu((m) => !m)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4479AB] text-sm font-bold text-white"
              title={userLabel}
            >
              {userLabel.trim()[0]?.toUpperCase() ?? '?'}
            </button>
            {menu && (
              <div className="absolute right-0 top-11 z-50 w-56 rounded-md border border-slate-200 bg-white py-1 text-sm shadow-lg" onMouseLeave={() => setMenu(false)}>
                <div className="truncate px-3 py-2 text-xs text-slate-400">{userLabel}</div>
                {role === 'client' && (
                  <button type="button" className="block w-full px-3 py-2 text-left hover:bg-slate-50" onClick={() => { setMenu(false); setPwOpen(true); }}>
                    Wachtwoord wijzigen
                  </button>
                )}
                {role === 'admin' && (
                  <a href="/admin/aitd" className="block px-3 py-2 hover:bg-slate-50">Beheerpaneel (accounts, versies)</a>
                )}
                <button type="button" className="block w-full px-3 py-2 text-left text-red-600 hover:bg-slate-50" onClick={logout}>
                  {role === 'admin' ? 'Editor sluiten' : 'Uitloggen'}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {readOnly && (
        <div className="bg-amber-50 px-4 py-2 text-center text-sm text-amber-800">
          Bewerken is tijdelijk uitgeschakeld door de beheerder. Je kunt de site wel bekijken.
        </div>
      )}
      {locked && role === 'admin' && (
        <div className="bg-amber-50 px-4 py-2 text-center text-sm text-amber-800">
          De klant kan nu niet bewerken (vergrendeld). Ontgrendelen kan in het beheerpaneel.
        </div>
      )}
      {status.kind === 'error' && (
        <div className="flex items-center justify-center gap-3 bg-red-50 px-4 py-2 text-sm text-red-700" role="alert">
          {status.text}
          <button type="button" className="underline" onClick={() => setStatus({ kind: 'idle' })}>Sluiten</button>
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        {/* Links: onderdelen / pagina's / instellingen */}
        <aside className="flex w-72 shrink-0 flex-col border-r border-slate-200 bg-white">
          <div className="grid grid-cols-3 border-b border-slate-200 text-xs font-semibold">
            {(
              [
                ['blocks', 'Onderdelen'],
                ['pages', 'Pagina’s'],
                ['settings', 'Instellingen'],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setTab(k)}
                className={`py-3 ${tab === k ? 'border-b-2 border-[#0B2E52] text-[#0B2E52]' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">
            {tab === 'blocks' && <Palette />}
            {tab === 'pages' && <PagesPanel />}
            {tab === 'settings' && <SettingsPanel />}
          </div>
        </aside>

        {/* Midden: de pagina */}
        <main className="min-w-0 flex-1">
          <Canvas />
        </main>

        {/* Rechts: instellingen van het gekozen onderdeel */}
        {selected && (
          <aside className="w-80 shrink-0 border-l border-slate-200 bg-white">
            <BlockForm key={selected.id} block={selected} onClose={() => select(null)} />
          </aside>
        )}
      </div>

      {pwOpen && <PasswordDialog onClose={() => setPwOpen(false)} />}
    </div>
  );
}

function StatusText({ status, dirty, lastPublished }: { status: Status; dirty: boolean; lastPublished: string | null }) {
  let text: string;
  let cls = 'text-slate-400';
  if (status.kind === 'saving') text = 'Opslaan…';
  else if (status.kind === 'publishing') text = 'Publiceren…';
  else if (status.kind === 'saved' || status.kind === 'published') {
    text = status.text ?? '';
    cls = 'text-emerald-600';
  } else if (dirty) {
    text = 'Niet-opgeslagen wijzigingen';
    cls = 'text-amber-600';
  } else text = lastPublished ? `Laatst gepubliceerd ${formatAgo(lastPublished)}` : '';
  return <span className={`hidden text-xs font-medium lg:inline ${cls}`}>{text}</span>;
}

function formatAgo(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function TopBtn({ children, title, onClick, disabled }: { children: React.ReactNode; title: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-md text-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30"
    >
      {children}
    </button>
  );
}
