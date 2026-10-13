'use client';

import { useEffect, useRef, useState } from 'react';
import type { Block, BlockType } from '@/lib/aitd/types';
import { newId } from '@/lib/aitd/types';
import { BLOCK_LABELS, makeBlock } from '@/lib/aitd/defaults';
import { BlockView, SiteFooter, SiteHeader, type RenderCtx } from '../../_site/render';
import { useEditor } from './state';

// Wat er gesleept wordt (palet → canvas, of blok binnen het canvas).
export type DragPayload = { kind: 'new'; type: BlockType } | { kind: 'move'; id: string };
export const dragState: { current: DragPayload | null } = { current: null };

const DESIGN_WIDTH = 1100; // het canvas toont de site zoals op een laptop, verkleind

export function insertBlock(blocks: Block[], payload: DragPayload, index: number): { blocks: Block[]; id: string } | null {
  if (payload.kind === 'new') {
    const b = makeBlock(payload.type);
    const next = [...blocks];
    next.splice(index, 0, b);
    return { blocks: next, id: b.id };
  }
  const from = blocks.findIndex((b) => b.id === payload.id);
  if (from < 0) return null;
  const to = from < index ? index - 1 : index;
  if (to === from) return null;
  const next = [...blocks];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return { blocks: next, id: moved.id };
}

export function Canvas() {
  const { doc, page, pageIndex, update, select, selectedId, readOnly } = useEditor();
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const outer = useRef<HTMLDivElement>(null);

  // Verkleinen zodat de laptopweergave in het beschikbare vak past.
  useEffect(() => {
    const el = outer.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setZoom(Math.min(1, (el.clientWidth - 48) / DESIGN_WIDTH)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Sleepindicator weghalen als het slepen ergens anders eindigt.
  useEffect(() => {
    const end = () => setDropIndex(null);
    window.addEventListener('dragend', end);
    window.addEventListener('drop', end);
    return () => {
      window.removeEventListener('dragend', end);
      window.removeEventListener('drop', end);
    };
  }, []);

  const ctx: RenderCtx = { site: doc, page, base: '/aitd', editing: true };
  const blocks = page.blocks;

  function onDrop(index: number) {
    const payload = dragState.current;
    dragState.current = null;
    setDropIndex(null);
    if (!payload || readOnly) return;
    const res = insertBlock(blocks, payload, index);
    if (!res) return;
    update((d) => {
      d.pages[pageIndex].blocks = res.blocks;
    });
    select(res.id);
  }

  function overBlock(e: React.DragEvent, i: number) {
    if (!dragState.current || readOnly) return;
    e.preventDefault();
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDropIndex(e.clientY < r.top + r.height / 2 ? i : i + 1);
  }

  function moveBy(id: string, dir: -1 | 1) {
    update((d) => {
      const list = d.pages[pageIndex].blocks;
      const i = list.findIndex((b) => b.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= list.length) return;
      [list[i], list[j]] = [list[j], list[i]];
    });
  }

  function duplicate(id: string) {
    const copyId = newId();
    update((d) => {
      const list = d.pages[pageIndex].blocks;
      const i = list.findIndex((b) => b.id === id);
      if (i < 0) return;
      const copy = structuredClone(list[i]);
      copy.id = copyId;
      copy.nav = '';
      list.splice(i + 1, 0, copy);
    });
    select(copyId);
  }

  function remove(id: string) {
    const b = blocks.find((x) => x.id === id);
    if (!b || !confirm(`“${BLOCK_LABELS[b.type].name}” verwijderen? (Je kunt dit ongedaan maken met de pijl linksboven.)`)) return;
    update((d) => {
      d.pages[pageIndex].blocks = d.pages[pageIndex].blocks.filter((x) => x.id !== id);
    });
    if (selectedId === id) select(null);
  }

  return (
    <div ref={outer} className="h-full overflow-y-auto bg-slate-200/70 px-6 py-6" onClick={() => select(null)}>
      <div
        className="mx-auto overflow-hidden rounded-md bg-white shadow-xl ring-1 ring-slate-300"
        style={{ width: DESIGN_WIDTH, zoom }}
      >
        <div className="pointer-events-none select-none">
          <SiteHeader ctx={ctx} />
        </div>

        <div
          onDragOver={(e) => {
            if (dragState.current && !readOnly && blocks.length === 0) {
              e.preventDefault();
              setDropIndex(0);
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            onDrop(dropIndex ?? blocks.length);
          }}
        >
          {blocks.length === 0 && (
            <div
              className={`m-10 flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed text-center ${
                dropIndex === 0 ? 'border-[#4479AB] bg-[#4479AB]/5' : 'border-slate-300'
              }`}
            >
              <p className="text-lg font-semibold text-slate-600">Deze pagina is nog leeg</p>
              <p className="mt-1 text-slate-400">Sleep een onderdeel van links hierheen.</p>
            </div>
          )}

          {blocks.map((b, i) => (
            <div key={b.id}>
              {dropIndex === i && <DropLine />}
              <EditableBlock
                block={b}
                ctx={ctx}
                selected={b.id === selectedId}
                first={i === 0}
                last={i === blocks.length - 1}
                readOnly={readOnly}
                onSelect={() => select(b.id)}
                onDragOver={(e) => overBlock(e, i)}
                onUp={() => moveBy(b.id, -1)}
                onDown={() => moveBy(b.id, 1)}
                onDuplicate={() => duplicate(b.id)}
                onRemove={() => remove(b.id)}
              />
            </div>
          ))}
          {blocks.length > 0 && dropIndex === blocks.length && <DropLine />}
        </div>

        <div className="pointer-events-none select-none">
          <SiteFooter />
        </div>
      </div>
    </div>
  );
}

function DropLine() {
  return (
    <div className="relative z-20 h-0">
      <div className="absolute inset-x-0 -top-1 h-2 rounded-full bg-[#4479AB] shadow-[0_0_0_4px_rgba(68,121,171,0.25)]" />
      <span className="absolute left-1/2 -top-4 -translate-x-1/2 rounded-full bg-[#4479AB] px-3 py-1 text-sm font-semibold text-white">
        Hier neerzetten
      </span>
    </div>
  );
}

function EditableBlock({
  block,
  ctx,
  selected,
  first,
  last,
  readOnly,
  onSelect,
  onDragOver,
  onUp,
  onDown,
  onDuplicate,
  onRemove,
}: {
  block: Block;
  ctx: RenderCtx;
  selected: boolean;
  first: boolean;
  last: boolean;
  readOnly: boolean;
  onSelect: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onUp: () => void;
  onDown: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={`group relative cursor-pointer ${selected ? 'outline outline-4 -outline-offset-4 outline-[#4479AB]' : 'hover:outline hover:outline-2 hover:-outline-offset-2 hover:outline-[#4479AB]/60'}`}
      draggable={!readOnly}
      onDragStart={(e) => {
        dragState.current = { kind: 'move', id: block.id };
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', block.id);
      }}
      onDragOver={onDragOver}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <div className="pointer-events-none select-none">
        <BlockView block={block} ctx={ctx} />
      </div>

      <div
        className={`absolute left-3 top-3 z-10 rounded bg-[#0B2E52] px-3 py-1.5 text-sm font-semibold text-white shadow ${
          selected ? 'block' : 'hidden group-hover:block'
        }`}
      >
        {readOnly ? '' : '⠿ '}
        {BLOCK_LABELS[block.type].name}
        {block.nav && <span className="ml-2 font-normal text-[#8FB4D9]">menu: {block.nav}</span>}
      </div>

      {!readOnly && (
        <div
          className={`absolute right-3 top-3 z-10 items-center gap-1 rounded-md bg-white p-1 shadow-lg ring-1 ring-slate-200 ${
            selected ? 'flex' : 'hidden group-hover:flex'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <ToolBtn title="Omhoog" disabled={first} onClick={onUp}>↑</ToolBtn>
          <ToolBtn title="Omlaag" disabled={last} onClick={onDown}>↓</ToolBtn>
          <ToolBtn title="Dupliceren" onClick={onDuplicate}>⧉</ToolBtn>
          <ToolBtn title="Bewerken" onClick={onSelect}>✎</ToolBtn>
          <ToolBtn title="Verwijderen" danger onClick={onRemove}>🗑</ToolBtn>
        </div>
      )}
    </div>
  );
}

function ToolBtn({
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
      className={`flex h-9 w-9 items-center justify-center rounded text-lg disabled:opacity-25 ${
        danger ? 'hover:bg-red-50' : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  );
}
