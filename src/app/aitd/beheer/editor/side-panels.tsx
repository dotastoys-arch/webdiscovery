'use client';

import { useState } from 'react';
import { BLOCK_TYPES, RESERVED_SLUGS, newId, slugify, type BlockType } from '@/lib/aitd/types';
import { BLOCK_LABELS, makeBlock } from '@/lib/aitd/defaults';
import { useEditor } from './state';
import { dragState } from './canvas';
import { Choice, IconBtn, LinkField, TextArea, TextField, inputCls } from './fields';

// Linkerpaneel: onderdelen (slepen), pagina's en algemene instellingen.

const PALETTE_ICONS: Record<BlockType, string> = {
  hero: '▣',
  services: '▦',
  steps: '☰',
  focus: '◩',
  text: '¶',
  image: '🖼',
  imageText: '◧',
  gallery: '▤',
  quote: '❝',
  cta: '➜',
  contact: '✉',
};

export function Palette() {
  const { update, pageIndex, page, selectedId, select, readOnly } = useEditor();

  function addAtEnd(type: BlockType) {
    const b = makeBlock(type);
    const sel = page.blocks.findIndex((x) => x.id === selectedId);
    update((d) => {
      const list = d.pages[pageIndex].blocks;
      list.splice(sel >= 0 ? sel + 1 : list.length, 0, b);
    });
    select(b.id);
  }

  return (
    <div className="space-y-2 p-4">
      <p className="text-xs leading-relaxed text-slate-500">
        <strong className="text-slate-700">Sleep</strong> een onderdeel naar de pagina, of klik erop om het toe te voegen
        {selectedId ? ' onder het geselecteerde onderdeel' : ' onderaan'}.
      </p>
      {BLOCK_TYPES.map((t) => (
        <button
          key={t}
          type="button"
          disabled={readOnly}
          draggable={!readOnly}
          onDragStart={(e) => {
            dragState.current = { kind: 'new', type: t };
            e.dataTransfer.effectAllowed = 'copy';
            e.dataTransfer.setData('text/plain', t);
          }}
          onDragEnd={() => (dragState.current = null)}
          onClick={() => addAtEnd(t)}
          className="flex w-full cursor-grab items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2.5 text-left shadow-sm transition hover:border-[#4479AB] hover:shadow active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[#0B2E52]/5 text-lg text-[#0B2E52]">
            {PALETTE_ICONS[t]}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-slate-800">{BLOCK_LABELS[t].name}</span>
            <span className="block truncate text-[11px] text-slate-400">{BLOCK_LABELS[t].hint}</span>
          </span>
          <span className="ml-auto text-slate-300" aria-hidden>⠿</span>
        </button>
      ))}
    </div>
  );
}

export function PagesPanel() {
  const { doc, update, pageIndex, setPageIndex, readOnly } = useEditor();
  const [newTitle, setNewTitle] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const multi = doc.layout === 'multi_page';

  function uniqueSlug(base: string, skipIndex?: number) {
    let s = slugify(base) || 'pagina';
    if (RESERVED_SLUGS.includes(s)) s = `${s}-pagina`;
    let n = 2;
    const taken = (x: string) => doc.pages.some((p, i) => i !== skipIndex && p.slug === x);
    const root = s;
    while (taken(s)) s = `${root}-${n++}`;
    return s;
  }

  function addPage() {
    const title = newTitle.trim();
    if (!title) return setErr('Geef de pagina een naam.');
    setErr(null);
    const slug = uniqueSlug(title);
    const hero = makeBlock('text');
    if (hero.type === 'text') hero.data.title = title;
    update((d) => {
      d.pages.push({ id: newId(), slug, title, blocks: [hero] });
    });
    setNewTitle('');
    setPageIndex(doc.pages.length);
  }

  return (
    <div className="space-y-5 p-4">
      <Choice
        label="Opzet van de website"
        value={doc.layout}
        options={[
          { value: 'one_page', label: 'Eén pagina' },
          { value: 'multi_page', label: 'Meerdere pagina’s' },
        ]}
        onChange={(v) => {
          if (v === doc.layout) return;
          if (v === 'one_page' && doc.pages.length > 1 &&
            !confirm('Bij “Eén pagina” is alleen de homepage zichtbaar. De andere pagina’s blijven bewaard en komen terug als je weer “Meerdere pagina’s” kiest. Doorgaan?')) return;
          update((d) => {
            d.layout = v;
          });
          if (v === 'one_page') setPageIndex(0);
        }}
      />
      <p className="text-xs leading-relaxed text-slate-500">
        {multi
          ? 'Elke pagina heeft een eigen adres en staat in het menu bovenaan. De eerste pagina is de homepage.'
          : 'Alles staat op één lange pagina. Het menu springt naar onderdelen die een “naam in het menu” hebben.'}
      </p>

      {multi && (
        <>
          <div className="space-y-1.5">
            <span className="block text-xs font-semibold text-slate-600">Pagina’s</span>
            {doc.pages.map((p, i) => (
              <div
                key={p.id}
                className={`rounded-md border ${i === pageIndex ? 'border-[#4479AB] bg-[#4479AB]/5' : 'border-slate-200 bg-white'}`}
              >
                <div className="flex items-center gap-1 px-2 py-1.5">
                  <button type="button" onClick={() => setPageIndex(i)} className="min-w-0 flex-1 text-left">
                    <span className="block truncate text-sm font-semibold text-slate-800">{p.title}</span>
                    <span className="block truncate text-[11px] text-slate-400">/aitd{p.slug ? `/${p.slug}` : ''}</span>
                  </button>
                  {!readOnly && i > 0 && (
                    <>
                      <IconBtn
                        title="Eerder in het menu"
                        disabled={i === 1}
                        onClick={() =>
                          update((d) => {
                            [d.pages[i - 1], d.pages[i]] = [d.pages[i], d.pages[i - 1]];
                          })
                        }
                      >
                        ↑
                      </IconBtn>
                      <IconBtn
                        title="Later in het menu"
                        disabled={i === doc.pages.length - 1}
                        onClick={() =>
                          update((d) => {
                            [d.pages[i + 1], d.pages[i]] = [d.pages[i], d.pages[i + 1]];
                          })
                        }
                      >
                        ↓
                      </IconBtn>
                      <IconBtn
                        title="Pagina verwijderen"
                        danger
                        onClick={() => {
                          if (!confirm(`De pagina “${p.title}” verwijderen?`)) return;
                          update((d) => {
                            d.pages.splice(i, 1);
                          });
                          setPageIndex(0);
                        }}
                      >
                        ✕
                      </IconBtn>
                    </>
                  )}
                </div>
                {i === pageIndex && (
                  <div className="space-y-3 border-t border-slate-100 p-3">
                    <TextField
                      label="Naam (ook in het menu)"
                      value={p.title}
                      max={80}
                      onChange={(v) =>
                        update((d) => {
                          d.pages[i].title = v;
                        }, { coalesce: `page-title-${p.id}` })
                      }
                    />
                    {i > 0 && (
                      <TextField
                        label="Adres"
                        value={p.slug}
                        max={60}
                        hint={`webdiscovery.nl/aitd/${p.slug || '…'}`}
                        onChange={(v) =>
                          update((d) => {
                            d.pages[i].slug = v.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-{2,}/g, '-').replace(/^-/, '').slice(0, 60);
                          }, { coalesce: `page-slug-${p.id}` })
                        }
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          {!readOnly && (
            <div className="space-y-2 rounded-md border border-dashed border-slate-300 p-3">
              <span className="block text-xs font-semibold text-slate-600">Nieuwe pagina</span>
              <input
                className={inputCls}
                placeholder="Bijv. About us"
                value={newTitle}
                maxLength={80}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addPage()}
              />
              {err && <p className="text-xs text-red-600">{err}</p>}
              <button
                type="button"
                onClick={addPage}
                className="w-full rounded-md bg-[#0B2E52] py-2 text-xs font-semibold text-white hover:opacity-90"
              >
                + Pagina toevoegen
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function SettingsPanel() {
  const { doc, update } = useEditor();
  const s = doc.settings;
  return (
    <div className="space-y-4 p-4">
      <LinkField
        label="Knop rechtsboven in het menu"
        value={s.headerCta}
        onChange={(v) =>
          update((d) => {
            d.settings.headerCta = v;
          }, { coalesce: 'headerCta' })
        }
      />
      <TextField
        label="Titel in Google / het tabblad"
        value={s.seoTitle}
        max={120}
        onChange={(v) =>
          update((d) => {
            d.settings.seoTitle = v;
          }, { coalesce: 'seoTitle' })
        }
      />
      <TextArea
        label="Omschrijving in Google"
        value={s.seoDescription}
        max={300}
        rows={4}
        hint="Eén of twee zinnen; dit zien mensen onder de titel in zoekresultaten."
        onChange={(v) =>
          update((d) => {
            d.settings.seoDescription = v;
          }, { coalesce: 'seoDescription' })
        }
      />
    </div>
  );
}
