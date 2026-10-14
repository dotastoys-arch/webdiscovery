'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useUi } from './ui';

type Item = { id: string; name: string; bytes: number; width: number | null; height: number | null; inUse: boolean };

const MAX_SIDE = 2000;

// Verkleint een foto in de browser (max 2000 px, WebP) zodat uploads klein blijven.
// GIF's blijven ongemoeid (animaties).
async function prepare(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  if (file.type === 'image/gif') {
    bitmap.close();
    return { blob: file, width, height };
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/webp', 0.85));
  // Valt terug op JPEG als de browser geen WebP kan maken.
  const out = blob && blob.type === 'image/webp' ? blob : await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.85));
  if (!out) throw new Error('Kon de foto niet verwerken.');
  return { blob: out, width: w, height: h };
}

export async function uploadImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    throw new Error(`"${file.name}" is geen foto (gebruik JPG, PNG, WebP of GIF).`);
  }
  const { blob, width, height } = await prepare(file);
  const res = await fetch('/api/aitd/media', {
    method: 'POST',
    headers: {
      'content-type': blob.type,
      'x-file-name': encodeURIComponent(file.name),
      'x-width': String(width),
      'x-height': String(height),
    },
    body: blob,
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error ?? 'Uploaden mislukt.');
  return j.id as string;
}

export function MediaLibrary({ onClose, onPick }: { onClose: () => void; onPick: (id: string, name: string) => void }) {
  const [items, setItems] = useState<Item[] | null>(null);
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const { confirm } = useUi();
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(
    () =>
      fetch('/api/aitd/media')
        .then(async (res) => {
          const j = await res.json().catch(() => ({}));
          if (res.ok) setItems(j.items);
          else setError(j.error ?? 'Foto’s laden mislukt.');
        })
        .catch(() => setError('Foto’s laden mislukt.')),
    []
  );

  useEffect(() => {
    void load();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [load, onClose]);

  async function handleFiles(files: FileList | File[]) {
    setError(null);
    const list = Array.from(files);
    setBusy((b) => b + list.length);
    let lastId: { id: string; name: string } | null = null;
    for (const f of list) {
      try {
        lastId = { id: await uploadImage(f), name: f.name };
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setBusy((b) => b - 1);
      }
    }
    await load();
    // Eén foto geüpload? Dan meteen kiezen.
    if (list.length === 1 && lastId) onPick(lastId.id, lastId.name);
  }

  async function remove(it: Item) {
    if (!(await confirm({ title: 'Foto definitief verwijderen?', message: `“${it.name || 'Deze foto'}” wordt uit de fotobibliotheek gehaald. Dit kan niet ongedaan worden gemaakt.`, confirmLabel: 'Verwijderen', danger: true }))) return;
    const res = await fetch(`/api/aitd/media/${it.id}`, { method: 'DELETE' });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) setError(j.error ?? 'Verwijderen mislukt.');
    load();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-6" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-label="Foto’s"
        className="flex max-h-[85vh] w-full max-w-4xl flex-col rounded-lg bg-white shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-bold text-[#0B2E52]">Foto’s</h2>
          <div className="flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-md bg-[#0B2E52] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Foto uploaden
            </button>
            <button type="button" onClick={onClose} className="rounded-md px-3 py-2 text-sm text-slate-500 hover:bg-slate-100">
              Sluiten
            </button>
          </div>
        </div>

        <div
          className={`relative flex-1 overflow-y-auto p-5 ${over ? 'bg-[#4479AB]/5' : ''}`}
          onDragOver={(e) => {
            if (e.dataTransfer.types.includes('Files')) {
              e.preventDefault();
              setOver(true);
            }
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
          }}
        >
          {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          {busy > 0 && <p className="mb-4 text-sm text-slate-500">Bezig met uploaden ({busy})…</p>}
          {items === null ? (
            <p className="text-sm text-slate-400">Laden…</p>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 py-16 text-center">
              <p className="text-sm font-medium text-slate-600">Nog geen foto’s</p>
              <p className="mt-1 text-sm text-slate-400">Sleep foto’s hierheen of klik op “Foto uploaden”.</p>
            </div>
          ) : (
            <>
              <p className="mb-3 text-xs text-slate-400">Klik op een foto om hem te gebruiken. Je kunt ook foto’s hierheen slepen.</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {items.map((it) => (
                  <div key={it.id} className="group relative overflow-hidden rounded-md border border-slate-200">
                    <button type="button" className="block w-full" onClick={() => onPick(it.id, it.name)}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/api/aitd/media/${it.id}`} alt={it.name} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                    </button>
                    <div className="flex items-center justify-between gap-2 px-2 py-1.5 text-[11px] text-slate-500">
                      <span className="truncate" title={it.name}>{it.name || 'foto'}</span>
                      {it.inUse ? (
                        <span className="shrink-0 rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-700">in gebruik</span>
                      ) : (
                        <button type="button" onClick={() => remove(it)} className="shrink-0 text-red-500 hover:underline">
                          verwijder
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
