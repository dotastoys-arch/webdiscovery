import { z } from 'zod';

// Inhoudsmodel van de AITD-site (bewerkbaar via /aitd/beheer).
// De hele site is één JSON-document: instellingen + pagina's met blokken.
// Dit bestand is client- én server-veilig (geen DB/Node-imports).

const str = (max: number) => z.string().max(max);

export const linkSchema = z.object({ label: str(80), href: str(300) });
// Afbeelding = verwijzing naar aitd_media (id) + alt-tekst. id leeg = geen foto.
export const imageSchema = z.object({ id: str(64), alt: str(200) });

export const ICONS = [
  'globe',
  'scenario',
  'radar',
  'imagery',
  'shield',
  'chart',
  'document',
  'people',
  'map',
  'idea',
] as const;
export type IconName = (typeof ICONS)[number];

export const BACKGROUNDS = ['white', 'light', 'navy'] as const;
const bg = z.enum(BACKGROUNDS);

export const blockDataSchemas = {
  hero: z.object({
    eyebrow: str(120),
    title: str(160),
    highlight: str(160),
    text: str(600),
    primary: linkSchema,
    secondary: linkSchema,
    visual: z.enum(['radar', 'image', 'none']),
    image: imageSchema,
    strip: str(200),
  }),
  services: z.object({
    label: str(80),
    title: str(200),
    items: z.array(z.object({ icon: z.enum(ICONS), title: str(120), text: str(1200) })).max(12),
  }),
  steps: z.object({
    label: str(80),
    title: str(200),
    text: str(800),
    steps: z.array(z.object({ title: str(120), text: str(600) })).max(10),
    finalTitle: str(160),
    finalText: str(600),
  }),
  focus: z.object({
    label: str(80),
    cards: z.array(z.object({ tag: str(8), title: str(120) })).max(6),
    note: str(400),
  }),
  text: z.object({ label: str(80), title: str(200), body: str(6000), align: z.enum(['left', 'center']), background: bg }),
  image: z.object({ image: imageSchema, caption: str(300), size: z.enum(['contained', 'full']) }),
  imageText: z.object({
    label: str(80),
    title: str(200),
    text: str(3000),
    image: imageSchema,
    side: z.enum(['left', 'right']),
    background: bg,
  }),
  gallery: z.object({
    label: str(80),
    title: str(200),
    images: z.array(z.object({ image: imageSchema, caption: str(200) })).max(24),
  }),
  quote: z.object({ text: str(800), author: str(120), role: str(120) }),
  cta: z.object({ title: str(200), text: str(600), button: linkSchema, background: bg }),
  contact: z.object({ label: str(80), title: str(200), text: str(600) }),
};

export type BlockType = keyof typeof blockDataSchemas;
export const BLOCK_TYPES = Object.keys(blockDataSchemas) as BlockType[];
export type BlockData<T extends BlockType> = z.infer<(typeof blockDataSchemas)[T]>;

const blockSchema = z.discriminatedUnion(
  'type',
  BLOCK_TYPES.map((t) =>
    z.object({
      id: str(40).min(1),
      type: z.literal(t),
      nav: str(40), // menulabel (one-page): leeg = niet in het menu
      data: blockDataSchemas[t],
    })
  ) as unknown as [z.ZodObject<z.ZodRawShape>, ...z.ZodObject<z.ZodRawShape>[]]
);

export type Block = { [T in BlockType]: { id: string; type: T; nav: string; data: BlockData<T> } }[BlockType];

export const pageSchema = z.object({
  id: str(40).min(1),
  slug: z
    .string()
    .max(60)
    .regex(/^$|^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Ongeldig paginaadres'),
  title: str(80).min(1),
  blocks: z.array(blockSchema).max(40),
});

export const siteSchema = z
  .object({
    layout: z.enum(['one_page', 'multi_page']),
    settings: z.object({
      seoTitle: str(120),
      seoDescription: str(300),
      headerCta: linkSchema,
    }),
    pages: z.array(pageSchema).min(1).max(20),
  })
  .superRefine((s, ctx) => {
    // Eerste pagina = homepage (slug leeg); overige slugs uniek en niet gereserveerd.
    if (s.pages[0].slug !== '') ctx.addIssue({ code: 'custom', message: 'De eerste pagina moet de homepage zijn.' });
    const seen = new Set<string>();
    s.pages.slice(1).forEach((p) => {
      if (!p.slug) ctx.addIssue({ code: 'custom', message: `Pagina "${p.title}" heeft geen adres.` });
      if (RESERVED_SLUGS.includes(p.slug)) ctx.addIssue({ code: 'custom', message: `Het adres "${p.slug}" is gereserveerd.` });
      if (seen.has(p.slug)) ctx.addIssue({ code: 'custom', message: `Het adres "${p.slug}" komt twee keer voor.` });
      seen.add(p.slug);
    });
  });

export const RESERVED_SLUGS = ['beheer', 'api', 'admin'];

export type Page = { id: string; slug: string; title: string; blocks: Block[] };
export type SiteDoc = {
  layout: 'one_page' | 'multi_page';
  settings: { seoTitle: string; seoDescription: string; headerCta: { label: string; href: string } };
  pages: Page[];
};

export function parseSite(input: unknown): { ok: true; site: SiteDoc } | { ok: false; error: string } {
  const r = siteSchema.safeParse(input);
  if (r.success) return { ok: true, site: r.data as unknown as SiteDoc };
  const issue = r.error.issues[0];
  return { ok: false, error: issue?.message ?? 'Ongeldige inhoud' };
}

export function newId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

// Anker-id van een blok in de one-page-navigatie.
export function anchorOf(b: Block): string {
  return b.type === 'contact' ? 'contact' : slugify(b.nav) || `b-${b.id}`;
}
