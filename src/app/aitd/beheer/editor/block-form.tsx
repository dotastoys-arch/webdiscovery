'use client';

import type { Block, BlockData, BlockType } from '@/lib/aitd/types';
import { ICONS, type IconName } from '@/lib/aitd/types';
import { BLOCK_LABELS } from '@/lib/aitd/defaults';
import { Icon } from '../../_site/render';
import { useBlockUpdater, useEditor } from './state';
import { Choice, ImageField, LinkField, ListEditor, TextArea, TextField } from './fields';

// Rechterpaneel: alle instellingen van het geselecteerde blok.

const ICON_LABELS: Record<IconName, string> = {
  globe: 'Wereldbol',
  scenario: 'Scenario’s',
  radar: 'Radar',
  imagery: 'Beeldanalyse',
  shield: 'Schild',
  chart: 'Grafiek',
  document: 'Document',
  people: 'Mensen',
  map: 'Kaart',
  idea: 'Idee',
};

const BG_OPTIONS = [
  { value: 'white' as const, label: 'Wit' },
  { value: 'light' as const, label: 'Lichtgrijs' },
  { value: 'navy' as const, label: 'Donkerblauw' },
];

export function BlockForm({ block, onClose }: { block: Block; onClose: () => void }) {
  const { doc } = useEditor();
  const upd = useBlockUpdater();

  // set('veld', waarde) — typen in hetzelfde veld wordt samengevoegd in de geschiedenis.
  function set<K extends string>(key: K, value: unknown) {
    upd(block.id, (b) => ((b.data as Record<string, unknown>)[key] = value), key);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Bewerken</div>
          <div className="text-sm font-bold text-[#0B2E52]">{BLOCK_LABELS[block.type].name}</div>
        </div>
        <button type="button" onClick={onClose} className="rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-slate-100" title="Sluiten">
          ✕
        </button>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {doc.layout === 'one_page' && block.type !== 'contact' && (
          <TextField
            label="Naam in het menu"
            value={block.nav}
            max={40}
            hint="Leeg laten = dit onderdeel staat niet in het menu bovenaan."
            onChange={(v) => upd(block.id, (b) => (b.nav = v), 'nav')}
          />
        )}
        <Fields type={block.type} data={block.data} set={set} />
      </div>
    </div>
  );
}

function Fields({ type, data, set }: { type: BlockType; data: Block['data']; set: (k: string, v: unknown) => void }) {
  switch (type) {
    case 'hero': {
      const d = data as BlockData<'hero'>;
      return (
        <>
          <TextField label="Klein kopje" value={d.eyebrow} max={120} onChange={(v) => set('eyebrow', v)} />
          <TextField label="Titel" value={d.title} max={160} onChange={(v) => set('title', v)} />
          <TextField label="Tweede regel (lichtblauw)" value={d.highlight} max={160} onChange={(v) => set('highlight', v)} />
          <TextArea label="Introductietekst" value={d.text} max={600} onChange={(v) => set('text', v)} />
          <LinkField label="Eerste knop (wit)" value={d.primary} onChange={(v) => set('primary', v)} />
          <LinkField label="Tweede knop (omlijnd)" value={d.secondary} onChange={(v) => set('secondary', v)} />
          <Choice
            label="Rechts in beeld"
            value={d.visual}
            options={[
              { value: 'radar', label: 'Radar' },
              { value: 'image', label: 'Foto' },
              { value: 'none', label: 'Niets' },
            ]}
            onChange={(v) => set('visual', v)}
          />
          {d.visual === 'image' && <ImageField label="Foto" value={d.image} onChange={(v) => set('image', v)} />}
          <TextField
            label="Balk onderaan"
            value={d.strip}
            max={200}
            hint="Korte regel in kleine letters onder het openingsblok. Leeg = geen balk."
            onChange={(v) => set('strip', v)}
          />
        </>
      );
    }
    case 'services': {
      const d = data as BlockData<'services'>;
      return (
        <>
          <TextField label="Klein kopje" value={d.label} max={80} onChange={(v) => set('label', v)} />
          <TextArea label="Titel" value={d.title} rows={2} max={200} onChange={(v) => set('title', v)} />
          <ListEditor
            label="Diensten"
            items={d.items}
            max={12}
            make={() => ({ icon: 'globe' as IconName, title: 'New service', text: 'Describe this service.' })}
            itemTitle={(it) => it.title}
            onChange={(v) => set('items', v)}
            render={(it, setIt) => (
              <>
                <IconPicker value={it.icon} onChange={(icon) => setIt({ ...it, icon })} />
                <TextField label="Naam" value={it.title} max={120} onChange={(v) => setIt({ ...it, title: v })} />
                <TextArea label="Omschrijving" value={it.text} max={1200} rows={5} onChange={(v) => setIt({ ...it, text: v })} />
              </>
            )}
          />
        </>
      );
    }
    case 'steps': {
      const d = data as BlockData<'steps'>;
      return (
        <>
          <TextField label="Klein kopje" value={d.label} max={80} onChange={(v) => set('label', v)} />
          <TextField label="Titel" value={d.title} max={200} onChange={(v) => set('title', v)} />
          <TextArea label="Tekst links" value={d.text} max={800} onChange={(v) => set('text', v)} />
          <ListEditor
            label="Stappen"
            items={d.steps}
            max={10}
            make={() => ({ title: 'New step', text: '' })}
            itemTitle={(it) => it.title}
            onChange={(v) => set('steps', v)}
            render={(it, setIt) => (
              <>
                <TextField label="Titel" value={it.title} max={120} onChange={(v) => setIt({ ...it, title: v })} />
                <TextArea label="Tekst" value={it.text} max={600} rows={3} onChange={(v) => setIt({ ...it, text: v })} />
              </>
            )}
          />
          <TextField label="Laatste stap (donker) — titel" value={d.finalTitle} max={160} onChange={(v) => set('finalTitle', v)} />
          <TextArea label="Laatste stap — tekst" value={d.finalText} max={600} rows={3} onChange={(v) => set('finalText', v)} />
        </>
      );
    }
    case 'focus': {
      const d = data as BlockData<'focus'>;
      return (
        <>
          <TextField label="Klein kopje" value={d.label} max={80} onChange={(v) => set('label', v)} />
          <ListEditor
            label="Kaarten"
            items={d.cards}
            max={6}
            make={() => ({ tag: 'NEW', title: 'Region' })}
            itemTitle={(it) => it.title}
            onChange={(v) => set('cards', v)}
            render={(it, setIt) => (
              <>
                <TextField label="Afkorting (groot)" value={it.tag} max={8} onChange={(v) => setIt({ ...it, tag: v })} />
                <TextField label="Titel" value={it.title} max={120} onChange={(v) => setIt({ ...it, title: v })} />
              </>
            )}
          />
          <TextArea label="Notitie (gestippeld vak)" value={d.note} max={400} rows={3} onChange={(v) => set('note', v)} />
        </>
      );
    }
    case 'text': {
      const d = data as BlockData<'text'>;
      return (
        <>
          <TextField label="Klein kopje" value={d.label} max={80} onChange={(v) => set('label', v)} />
          <TextField label="Titel" value={d.title} max={200} onChange={(v) => set('title', v)} />
          <TextArea
            label="Tekst"
            value={d.body}
            rows={10}
            max={6000}
            hint="Laat een lege regel tussen alinea’s."
            onChange={(v) => set('body', v)}
          />
          <Choice label="Uitlijning" value={d.align} options={[{ value: 'left', label: 'Links' }, { value: 'center', label: 'Midden' }]} onChange={(v) => set('align', v)} />
          <Choice label="Achtergrond" value={d.background} options={BG_OPTIONS} onChange={(v) => set('background', v)} />
        </>
      );
    }
    case 'image': {
      const d = data as BlockData<'image'>;
      return (
        <>
          <ImageField label="Foto" value={d.image} onChange={(v) => set('image', v)} />
          <TextField label="Onderschrift" value={d.caption} max={300} onChange={(v) => set('caption', v)} />
          <Choice
            label="Breedte"
            value={d.size}
            options={[
              { value: 'contained', label: 'Normaal' },
              { value: 'full', label: 'Volle breedte' },
            ]}
            onChange={(v) => set('size', v)}
          />
        </>
      );
    }
    case 'imageText': {
      const d = data as BlockData<'imageText'>;
      return (
        <>
          <ImageField label="Foto" value={d.image} onChange={(v) => set('image', v)} />
          <Choice label="Foto aan de" value={d.side} options={[{ value: 'left', label: 'Linkerkant' }, { value: 'right', label: 'Rechterkant' }]} onChange={(v) => set('side', v)} />
          <TextField label="Klein kopje" value={d.label} max={80} onChange={(v) => set('label', v)} />
          <TextField label="Titel" value={d.title} max={200} onChange={(v) => set('title', v)} />
          <TextArea label="Tekst" value={d.text} rows={8} max={3000} hint="Laat een lege regel tussen alinea’s." onChange={(v) => set('text', v)} />
          <Choice label="Achtergrond" value={d.background} options={BG_OPTIONS} onChange={(v) => set('background', v)} />
        </>
      );
    }
    case 'gallery': {
      const d = data as BlockData<'gallery'>;
      return (
        <>
          <TextField label="Klein kopje" value={d.label} max={80} onChange={(v) => set('label', v)} />
          <TextField label="Titel" value={d.title} max={200} onChange={(v) => set('title', v)} />
          <ListEditor
            label="Foto’s"
            items={d.images}
            max={24}
            make={() => ({ image: { id: '', alt: '' }, caption: '' })}
            itemTitle={(it, i) => it.caption || it.image.alt || `Foto ${i + 1}`}
            onChange={(v) => set('images', v)}
            render={(it, setIt) => (
              <>
                <ImageField label="Foto" value={it.image} onChange={(v) => setIt({ ...it, image: v })} />
                <TextField label="Onderschrift" value={it.caption} max={200} onChange={(v) => setIt({ ...it, caption: v })} />
              </>
            )}
          />
        </>
      );
    }
    case 'quote': {
      const d = data as BlockData<'quote'>;
      return (
        <>
          <TextArea label="Citaat" value={d.text} max={800} onChange={(v) => set('text', v)} />
          <TextField label="Naam" value={d.author} max={120} onChange={(v) => set('author', v)} />
          <TextField label="Functie / organisatie" value={d.role} max={120} onChange={(v) => set('role', v)} />
        </>
      );
    }
    case 'cta': {
      const d = data as BlockData<'cta'>;
      return (
        <>
          <TextField label="Titel" value={d.title} max={200} onChange={(v) => set('title', v)} />
          <TextArea label="Tekst" value={d.text} max={600} rows={3} onChange={(v) => set('text', v)} />
          <LinkField label="Knop" value={d.button} onChange={(v) => set('button', v)} />
          <Choice label="Achtergrond" value={d.background} options={BG_OPTIONS} onChange={(v) => set('background', v)} />
        </>
      );
    }
    case 'contact': {
      const d = data as BlockData<'contact'>;
      return (
        <>
          <TextField label="Klein kopje" value={d.label} max={80} onChange={(v) => set('label', v)} />
          <TextField label="Titel" value={d.title} max={200} onChange={(v) => set('title', v)} />
          <TextArea label="Tekst" value={d.text} max={600} rows={4} onChange={(v) => set('text', v)} />
          <p className="rounded-md bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
            Berichten via dit formulier worden gemaild naar AITD. Het e-mailadres staat niet op de website. In het
            voorbeeld hier kun je het formulier niet versturen.
          </p>
        </>
      );
    }
  }
}

function IconPicker({ value, onChange }: { value: IconName; onChange: (v: IconName) => void }) {
  const { readOnly } = useEditor();
  return (
    <div>
      <span className="mb-1 block text-xs font-semibold text-slate-600">Icoon</span>
      <div className="grid grid-cols-5 gap-1">
        {ICONS.map((i) => (
          <button
            key={i}
            type="button"
            title={ICON_LABELS[i]}
            disabled={readOnly}
            onClick={() => onChange(i)}
            className={`flex h-10 items-center justify-center rounded-md border ${
              value === i ? 'border-[#4479AB] bg-[#4479AB]/10' : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Icon name={i} className="h-6 w-6" />
          </button>
        ))}
      </div>
    </div>
  );
}
