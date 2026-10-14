'use client';

import { useState } from 'react';
import { anchorOf } from '@/lib/aitd/types';
import { useEditor } from './state';
import { MediaLibrary } from './media-library';
import { useUi } from './ui';

// Formulier-bouwstenen voor het instellingenpaneel van een blok.

export const inputCls =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-[#4479AB] focus:outline-none focus:ring-2 focus:ring-[#4479AB]/25 disabled:bg-slate-50';

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-600">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] leading-snug text-slate-400">{hint}</span>}
    </label>
  );
}

export function TextField({
  label,
  value,
  onChange,
  hint,
  max,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  max?: number;
  placeholder?: string;
}) {
  const { readOnly } = useEditor();
  return (
    <Field label={label} hint={hint}>
      <input
        className={inputCls}
        value={value}
        maxLength={max}
        placeholder={placeholder}
        disabled={readOnly}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  hint,
  rows = 4,
  max,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  rows?: number;
  max?: number;
}) {
  const { readOnly } = useEditor();
  return (
    <Field label={label} hint={hint}>
      <textarea
        className={`${inputCls} resize-y leading-relaxed`}
        value={value}
        rows={rows}
        maxLength={max}
        disabled={readOnly}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const { readOnly } = useEditor();
  return (
    <div>
      <span className="mb-1 block text-xs font-semibold text-slate-600">{label}</span>
      <div className="flex flex-wrap gap-1 rounded-md bg-slate-100 p-1">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            disabled={readOnly}
            onClick={() => onChange(o.value)}
            className={`flex-1 rounded px-2 py-1.5 text-xs font-medium transition ${
              value === o.value ? 'bg-white text-[#0B2E52] shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Link kiezen: onderdeel, pagina, of zelf een webadres / e-mail invullen.
export function LinkField({
  label,
  value,
  onChange,
  showLabel = true,
}: {
  label: string;
  value: { label: string; href: string };
  onChange: (v: { label: string; href: string }) => void;
  showLabel?: boolean;
}) {
  const { doc, readOnly } = useEditor();
  const pages = doc.layout === 'one_page' ? doc.pages.slice(0, 1) : doc.pages;
  const targets: { value: string; label: string }[] = [];
  pages.forEach((p) => {
    if (doc.layout === 'multi_page') targets.push({ value: `page:${p.slug}`, label: `Pagina: ${p.title}` });
    p.blocks
      .filter((b) => b.nav.trim() || b.type === 'contact')
      .forEach((b) =>
        targets.push({
          value: `#${anchorOf(b)}`,
          label: `${doc.layout === 'multi_page' ? `${p.title} › ` : 'Onderdeel: '}${b.nav || 'Contactformulier'}`,
        })
      );
  });
  const known = targets.some((t) => t.value === value.href);
  const mode = !value.href ? '' : known ? value.href : '__custom';

  return (
    <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50/60 p-3">
      <span className="block text-xs font-semibold text-slate-600">{label}</span>
      {showLabel && (
        <input
          className={inputCls}
          placeholder="Tekst op de knop (leeg = geen knop)"
          value={value.label}
          disabled={readOnly}
          onChange={(e) => onChange({ ...value, label: e.target.value })}
        />
      )}
      <select
        className={inputCls}
        value={mode}
        disabled={readOnly}
        onChange={(e) => {
          const v = e.target.value;
          onChange({ ...value, href: v === '__custom' ? 'https://' : v });
        }}
      >
        <option value="">— Kies waar de knop naartoe gaat —</option>
        {targets.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
        <option value="__custom">Webadres of e-mail…</option>
      </select>
      {mode === '__custom' && (
        <input
          className={inputCls}
          placeholder="https://… of mailto:naam@domein.nl"
          value={value.href}
          disabled={readOnly}
          onChange={(e) => onChange({ ...value, href: e.target.value })}
        />
      )}
    </div>
  );
}

// Aanbevolen formaat voor een fotovak. h = null: hoogte maakt niet uit.
export type ImageSize = { w: number; h: number | null; note?: string };

export function ImageField({
  label,
  value,
  onChange,
  size,
}: {
  label: string;
  value: { id: string; alt: string };
  onChange: (v: { id: string; alt: string }) => void;
  size?: ImageSize;
}) {
  const { readOnly } = useEditor();
  const [open, setOpen] = useState(false);
  // Echte afmetingen van de gekozen foto (uitgelezen zodra het plaatje geladen is).
  const [actual, setActual] = useState<{ id: string; w: number; h: number } | null>(null);
  const dims = actual && actual.id === value.id ? actual : null;
  const tooSmall = !!(dims && size && (dims.w < size.w * 0.75 || (size.h !== null && dims.h < size.h * 0.75)));
  return (
    <div className="space-y-2">
      <span className="block text-xs font-semibold text-slate-600">{label}</span>
      {size && (
        <span className="block text-[11px] leading-snug text-slate-500">
          Aanbevolen formaat:{' '}
          <strong className="font-semibold text-slate-700">
            {size.h === null ? `${size.w} px breed` : `${size.w} × ${size.h} px`}
          </strong>
          {size.note && <> — {size.note}</>}
        </span>
      )}
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={readOnly}
          onClick={() => setOpen(true)}
          className="group relative h-20 w-28 shrink-0 overflow-hidden rounded-md border border-slate-300 bg-slate-100"
          title="Foto kiezen"
        >
          {value.id ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/aitd/media/${value.id}`}
              alt=""
              className="h-full w-full object-cover"
              onLoad={(e) => setActual({ id: value.id, w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
            />
          ) : (
            <span className="flex h-full items-center justify-center text-[11px] text-slate-400">Geen foto</span>
          )}
          <span className="absolute inset-0 hidden items-center justify-center bg-black/40 text-xs font-semibold text-white group-hover:flex">
            Wijzigen
          </span>
        </button>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            disabled={readOnly}
            onClick={() => setOpen(true)}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
          >
            {value.id ? 'Andere foto' : 'Foto kiezen'}
          </button>
          {value.id && (
            <button
              type="button"
              disabled={readOnly}
              onClick={() => onChange({ id: '', alt: '' })}
              className="text-left text-xs text-red-600 hover:underline"
            >
              Foto weghalen
            </button>
          )}
        </div>
      </div>
      {dims && (
        <span className={`block text-[11px] leading-snug ${tooSmall ? 'text-amber-700' : 'text-slate-500'}`}>
          Deze foto: <strong className="font-semibold">{dims.w} × {dims.h} px</strong>
          {tooSmall && ' — aan de kleine kant, kan wat wazig worden. Kies liefst een grotere foto.'}
        </span>
      )}
      {value.id && (
        <input
          className={inputCls}
          placeholder="Korte beschrijving (voor blinden en Google)"
          value={value.alt}
          maxLength={200}
          disabled={readOnly}
          onChange={(e) => onChange({ ...value, alt: e.target.value })}
        />
      )}
      {open && (
        <MediaLibrary
          onClose={() => setOpen(false)}
          onPick={(id, name) => {
            onChange({ id, alt: value.alt || name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ') });
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

// Lijst met items (diensten, stappen, kaarten…): toevoegen, verwijderen, verschuiven.
export function ListEditor<T>({
  label,
  items,
  onChange,
  make,
  max,
  itemTitle,
  render,
}: {
  label: string;
  items: T[];
  onChange: (items: T[]) => void;
  make: () => T;
  max: number;
  itemTitle: (item: T, i: number) => string;
  render: (item: T, set: (v: T) => void, i: number) => React.ReactNode;
}) {
  const { readOnly } = useEditor();
  const { toast } = useUi();
  const [open, setOpen] = useState<number | null>(items.length ? 0 : null);
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    setOpen(j);
  };
  return (
    <div className="space-y-2">
      <span className="block text-xs font-semibold text-slate-600">{label}</span>
      {items.map((it, i) => (
        <div key={i} className="rounded-md border border-slate-200 bg-white">
          <div className="flex items-center gap-1 px-2 py-1.5">
            <button
              type="button"
              className="flex-1 truncate text-left text-sm font-medium text-slate-700"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span className="mr-1 text-slate-400">{open === i ? '▾' : '▸'}</span>
              {itemTitle(it, i) || `Item ${i + 1}`}
            </button>
            {!readOnly && (
              <>
                <IconBtn title="Omhoog" disabled={i === 0} onClick={() => move(i, -1)}>↑</IconBtn>
                <IconBtn title="Omlaag" disabled={i === items.length - 1} onClick={() => move(i, 1)}>↓</IconBtn>
                <IconBtn
                  title="Verwijderen"
                  danger
                  onClick={() => {
                    const before = items;
                    onChange(items.filter((_, k) => k !== i));
                    setOpen(null);
                    toast(`“${itemTitle(it, i) || 'Item'}” verwijderd`, { label: 'Ongedaan maken', onClick: () => onChange(before) });
                  }}
                >
                  ✕
                </IconBtn>
              </>
            )}
          </div>
          {open === i && (
            <div className="space-y-3 border-t border-slate-100 p-3">
              {render(
                it,
                (v) => onChange(items.map((x, k) => (k === i ? v : x))),
                i
              )}
            </div>
          )}
        </div>
      ))}
      {!readOnly && items.length < max && (
        <button
          type="button"
          onClick={() => {
            onChange([...items, make()]);
            setOpen(items.length);
          }}
          className="w-full rounded-md border border-dashed border-slate-300 py-2 text-xs font-semibold text-[#4479AB] hover:border-[#4479AB] hover:bg-[#4479AB]/5"
        >
          + Toevoegen
        </button>
      )}
    </div>
  );
}

export function IconBtn({
  children,
  title,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-7 w-7 items-center justify-center rounded text-sm disabled:opacity-30 ${
        danger ? 'text-red-500 hover:bg-red-50' : 'text-slate-500 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  );
}
