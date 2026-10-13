'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { Block, Page, SiteDoc } from '@/lib/aitd/types';

// Centrale editor-state: het sitedocument + ongedaan maken/opnieuw.
// Wijzigingen gaan altijd via update(mutator) op een kopie.

type Ctx = {
  doc: SiteDoc;
  update: (mutate: (d: SiteDoc) => void, opts?: { coalesce?: string }) => void;
  replace: (d: SiteDoc) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  pageIndex: number;
  setPageIndex: (i: number) => void;
  page: Page;
  selectedId: string | null;
  select: (id: string | null) => void;
  selected: Block | null;
  readOnly: boolean;
};

const EditorCtx = createContext<Ctx | null>(null);

export function useEditor(): Ctx {
  const c = useContext(EditorCtx);
  if (!c) throw new Error('useEditor buiten EditorProvider');
  return c;
}

const MAX_HISTORY = 60;

export function EditorProvider({
  initial,
  readOnly,
  onChange,
  children,
}: {
  initial: SiteDoc;
  readOnly: boolean;
  onChange: () => void;
  children: React.ReactNode;
}) {
  // doc + geschiedenis in één state-object, zodat elke wijziging atomair is.
  const [h, setH] = useState<{ doc: SiteDoc; past: SiteDoc[]; future: SiteDoc[] }>({ doc: initial, past: [], future: [] });
  const doc = h.doc;
  const [pageIndex, setPageIndexRaw] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Typen in één veld telt als één stap voor "ongedaan maken".
  const lastCoalesce = useRef<{ key: string; at: number } | null>(null);

  const update = useCallback<Ctx['update']>(
    (mutate, opts) => {
      if (readOnly) return;
      const now = Date.now();
      const lc = lastCoalesce.current;
      const merge = !!(opts?.coalesce && lc && lc.key === opts.coalesce && now - lc.at < 1500);
      lastCoalesce.current = opts?.coalesce ? { key: opts.coalesce, at: now } : null;
      setH((prev) => {
        const next = structuredClone(prev.doc);
        mutate(next);
        return {
          doc: next,
          past: merge ? prev.past : [...prev.past.slice(-MAX_HISTORY + 1), prev.doc],
          future: [],
        };
      });
      onChange();
    },
    [readOnly, onChange]
  );

  const replace = useCallback((d: SiteDoc) => setH({ doc: d, past: [], future: [] }), []);

  const undo = useCallback(() => {
    lastCoalesce.current = null;
    setH((prev) =>
      prev.past.length
        ? { doc: prev.past[prev.past.length - 1], past: prev.past.slice(0, -1), future: [prev.doc, ...prev.future] }
        : prev
    );
    onChange();
  }, [onChange]);

  const redo = useCallback(() => {
    lastCoalesce.current = null;
    setH((prev) =>
      prev.future.length ? { doc: prev.future[0], past: [...prev.past, prev.doc], future: prev.future.slice(1) } : prev
    );
    onChange();
  }, [onChange]);

  const safeIndex = Math.min(pageIndex, doc.pages.length - 1);
  const page = doc.pages[safeIndex];
  const selected = page.blocks.find((b) => b.id === selectedId) ?? null;

  const setPageIndex = useCallback((i: number) => {
    setPageIndexRaw(i);
    setSelectedId(null);
  }, []);

  return (
    <EditorCtx.Provider
      value={{
        doc,
        update,
        replace,
        undo,
        redo,
        canUndo: h.past.length > 0,
        canRedo: h.future.length > 0,
        pageIndex: safeIndex,
        setPageIndex,
        page,
        selectedId,
        select: setSelectedId,
        selected,
        readOnly,
      }}
    >
      {children}
    </EditorCtx.Provider>
  );
}

// Hulpje: blok op de huidige pagina bijwerken.
export function useBlockUpdater() {
  const { update, pageIndex } = useEditor();
  return useCallback(
    (blockId: string, mutate: (b: Block) => void, coalesce?: string) =>
      update(
        (d) => {
          const b = d.pages[pageIndex].blocks.find((x) => x.id === blockId);
          if (b) mutate(b);
        },
        { coalesce: coalesce ? `${blockId}:${coalesce}` : undefined }
      ),
    [update, pageIndex]
  );
}
