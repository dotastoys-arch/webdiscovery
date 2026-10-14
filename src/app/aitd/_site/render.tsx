import type { Block, BlockData, IconName, Page, SiteDoc } from '@/lib/aitd/types';
import { anchorOf } from '@/lib/aitd/types';
import { AitdMark } from '../logo';
import { MobileMenu } from '../mobile-menu';
import { Radar } from '../radar';
import { ContactForm } from '../contact-form';

// Weergave van de AITD-site op basis van het inhoudsdocument. Wordt gebruikt
// door de publieke pagina's én door de editor (live voorbeeld), dus geen
// server-only code hier.

export const NAVY = '#0B2E52';
export const ACCENT = '#4479AB';
// Fonts komen uit de root-layout (Plus Jakarta Sans + Hanken Grotesk).
export const heading = 'font-[family-name:var(--font-jakarta)]';
export const bodyFont = 'font-[family-name:var(--font-body)]';

export type RenderCtx = { site: SiteDoc; page: Page; base: string; editing?: boolean };

export function mediaUrl(id: string): string {
  return `/api/aitd/media/${id}`;
}

function pageUrl(base: string, p: Page): string {
  return p.slug ? `${base}/${p.slug}` : base || '/';
}

// Links: "page:<slug>" = interne pagina, "#anker" = onderdeel (ook op andere pagina's).
export function resolveHref(href: string, ctx: RenderCtx): string {
  const h = href.trim();
  if (!h) return '#';
  if (h.startsWith('page:')) {
    const p = ctx.site.pages.find((x) => x.slug === h.slice(5));
    return p ? pageUrl(ctx.base, p) : ctx.base || '/';
  }
  if (h.startsWith('#')) {
    const a = h.slice(1);
    if (ctx.page.blocks.some((b) => anchorOf(b) === a)) return h;
    const pages = ctx.site.layout === 'one_page' ? ctx.site.pages.slice(0, 1) : ctx.site.pages;
    const target = pages.find((p) => p.blocks.some((b) => anchorOf(b) === a));
    return target ? `${pageUrl(ctx.base, target)}${h}` : h;
  }
  if (/^(https?:|mailto:|tel:|\/)/.test(h)) return h;
  return `https://${h}`;
}

const external = (href: string) => /^https?:/.test(href);

export function navLinks(ctx: RenderCtx): { href: string; label: string; active?: boolean }[] {
  if (ctx.site.layout === 'multi_page') {
    return ctx.site.pages.slice(1).map((p) => ({ href: pageUrl(ctx.base, p), label: p.title, active: p.id === ctx.page.id }));
  }
  return ctx.site.pages[0].blocks.filter((b) => b.nav.trim()).map((b) => ({ href: `#${anchorOf(b)}`, label: b.nav }));
}

export function SiteView({ ctx }: { ctx: RenderCtx }) {
  return (
    // lang="en": de site is Engelstalig (de root-layout staat op Nederlands).
    <div lang="en" className={`${bodyFont} flex-1 bg-white text-slate-700`}>
      <SiteHeader ctx={ctx} />
      <main>
        {ctx.page.blocks.map((b) => (
          <BlockView key={b.id} block={b} ctx={ctx} />
        ))}
      </main>
      <SiteFooter />
    </div>
  );
}

export function SiteHeader({ ctx }: { ctx: RenderCtx }) {
  const links = navLinks(ctx);
  const cta = ctx.site.settings.headerCta;
  return (
    <header className={`${ctx.editing ? 'relative' : 'sticky top-0'} z-40 bg-white/90 backdrop-blur-md border-b border-slate-100`}>
      <div className="mx-auto max-w-6xl px-6 h-18 py-4 flex items-center justify-between">
        <a href={ctx.site.layout === 'multi_page' ? ctx.base || '/' : '#top'} className="flex items-center gap-3" aria-label="AITD Consulting — home">
          <AitdMark className="h-7 w-auto" />
          <span className={`${heading} hidden sm:inline text-[11px] font-semibold tracking-[0.35em] uppercase`} style={{ color: NAVY }}>
            Consulting
          </span>
        </a>
        <nav className={`${heading} flex items-center gap-3 md:gap-8 text-sm font-medium text-slate-600`}>
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              aria-current={l.active ? 'page' : undefined}
              className={`hidden md:inline hover:text-[#0B2E52] ${l.active ? 'text-[#0B2E52] font-semibold' : ''}`}
            >
              {l.label}
            </a>
          ))}
          {cta.label.trim() && (
            <a
              href={resolveHref(cta.href, ctx)}
              className="rounded-sm px-5 py-2.5 text-white transition hover:opacity-90"
              style={{ background: NAVY }}
            >
              {cta.label}
            </a>
          )}
          {links.length > 0 && <MobileMenu links={links} />}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-white border-t border-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
        <div className="flex items-center gap-3">
          <AitdMark className="h-5 w-auto" />
          <span>AITD Consulting BV</span>
        </div>
        <span className={`${heading} text-[11px] font-semibold tracking-[0.3em] uppercase`} style={{ color: ACCENT }}>
          All in the detail
        </span>
        <span>
          © {new Date().getFullYear()} · Website by{' '}
          <a
            href="https://webdiscovery.nl/?utm_source=aitd&utm_medium=footer"
            target="_blank"
            rel="noopener"
            className="font-semibold text-slate-600 underline-offset-4 hover:text-[#0B2E52] hover:underline"
          >
            WebDiscovery
          </a>
        </span>
      </div>
    </footer>
  );
}

export function BlockView({ block, ctx }: { block: Block; ctx: RenderCtx }) {
  const id = anchorOf(block);
  switch (block.type) {
    case 'hero':
      return <Hero id={block.id === ctx.page.blocks[0]?.id ? 'top' : id} d={block.data} ctx={ctx} />;
    case 'services':
      return <Services id={id} d={block.data} />;
    case 'steps':
      return <Steps id={id} d={block.data} />;
    case 'focus':
      return <Focus id={id} d={block.data} />;
    case 'text':
      return <TextBlock id={id} d={block.data} />;
    case 'image':
      return <ImageBlock id={id} d={block.data} ctx={ctx} />;
    case 'imageText':
      return <ImageText id={id} d={block.data} ctx={ctx} />;
    case 'gallery':
      return <Gallery id={id} d={block.data} ctx={ctx} />;
    case 'quote':
      return <Quote id={id} d={block.data} />;
    case 'cta':
      return <Cta id={id} d={block.data} ctx={ctx} />;
    case 'contact':
      return <Contact id={id} d={block.data} ctx={ctx} />;
  }
}

// ---------- hulpcomponenten ----------

function Paragraphs({ text, className = '' }: { text: string; className?: string }) {
  const parts = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return (
    <>
      {parts.map((p, i) => (
        <p key={i} className={`${className} ${i > 0 ? 'mt-4' : ''}`}>
          {p.split('\n').map((line, j) => (
            <span key={j}>
              {j > 0 && <br />}
              {line}
            </span>
          ))}
        </p>
      ))}
    </>
  );
}

export function SectionLabel({ children, light }: { children: React.ReactNode; light?: boolean }) {
  const c = light ? '#8FB4D9' : ACCENT;
  return (
    <p className={`${heading} flex items-center gap-3 text-xs font-semibold tracking-[0.3em] uppercase`} style={{ color: c }}>
      <span className="h-px w-8" style={{ background: c }} />
      {children}
    </p>
  );
}

function GridBackdrop() {
  return (
    <svg className="absolute inset-0 h-full w-full opacity-[0.07]" aria-hidden>
      <defs>
        <pattern id="aitd-grid" width="64" height="64" patternUnits="userSpaceOnUse">
          <path d="M64 0H0V64" fill="none" stroke="#fff" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#aitd-grid)" />
    </svg>
  );
}

function Img({
  image,
  ctx,
  className,
}: {
  image: { id: string; alt: string };
  ctx: RenderCtx;
  className?: string;
}) {
  if (!image.id) {
    if (!ctx.editing) return null;
    return (
      <div className={`${className} flex items-center justify-center bg-slate-100 text-sm text-slate-400 border-2 border-dashed border-slate-300 min-h-48`}>
        Nog geen foto gekozen
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={mediaUrl(image.id)} alt={image.alt} loading="lazy" className={className} />;
}

function Btn({ link, ctx, variant }: { link: { label: string; href: string }; ctx: RenderCtx; variant: 'solid' | 'ghost' | 'navy' }) {
  if (!link.label.trim()) return null;
  const href = resolveHref(link.href, ctx);
  const cls =
    variant === 'solid'
      ? 'bg-white hover:bg-slate-100 text-[#0B2E52]'
      : variant === 'navy'
        ? 'bg-[#0B2E52] hover:opacity-90 text-white'
        : 'border border-white/30 hover:border-white/70';
  return (
    <a
      href={href}
      {...(external(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={`rounded-sm px-6 py-3.5 transition ${cls}`}
    >
      {link.label}
    </a>
  );
}

const sectionBg: Record<string, string> = {
  white: 'bg-white',
  light: 'bg-slate-50 border-y border-slate-100',
  navy: 'text-white relative overflow-hidden',
};

// ---------- blokken ----------

function Hero({ id, d, ctx }: { id: string; d: BlockData<'hero'>; ctx: RenderCtx }) {
  const showVisual = d.visual === 'radar' || (d.visual === 'image' && (d.image.id || ctx.editing));
  return (
    <section id={id} className="relative overflow-hidden text-white scroll-mt-20" style={{ background: NAVY }}>
      <GridBackdrop />
      <div className="relative mx-auto max-w-6xl px-6 pt-24 pb-28 md:pt-32 md:pb-36 grid md:grid-cols-12 gap-12 items-center">
        <div className={showVisual ? 'md:col-span-7' : 'md:col-span-10'}>
          {d.eyebrow && (
            <p className={`${heading} text-xs font-semibold tracking-[0.3em] uppercase text-[#8FB4D9]`}>{d.eyebrow}</p>
          )}
          <h1 className={`${heading} mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight`}>
            {d.title}
            {d.highlight && (
              <>
                <br />
                <span className="text-[#8FB4D9]">{d.highlight}</span>
              </>
            )}
          </h1>
          {d.text && <p className="mt-8 max-w-xl text-lg leading-relaxed text-slate-300">{d.text}</p>}
          {(d.primary.label || d.secondary.label) && (
            <div className={`${heading} mt-10 flex flex-wrap gap-4 text-sm font-semibold`}>
              <Btn link={d.primary} ctx={ctx} variant="solid" />
              <Btn link={d.secondary} ctx={ctx} variant="ghost" />
            </div>
          )}
        </div>
        {showVisual && (
          <div className="md:col-span-5 hidden md:block">
            {d.visual === 'radar' ? <Radar /> : <Img image={d.image} ctx={ctx} className="w-full rounded-sm object-cover aspect-[4/3]" />}
          </div>
        )}
      </div>
      {d.strip && (
        <div className="relative border-t border-white/10">
          <div className={`${heading} mx-auto max-w-6xl px-6 py-5 text-[11px] font-semibold tracking-[0.25em] uppercase text-slate-400`}>
            {d.strip}
          </div>
        </div>
      )}
    </section>
  );
}

const iconPaths: Record<IconName, React.ReactNode> = {
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
    </>
  ),
  scenario: (
    <>
      <path d="M4 12h5l3-6M9 12l3 6M12 6h8M12 18h8M12 12h8" />
      <circle cx="4" cy="12" r="1.5" />
    </>
  ),
  radar: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <path d="M12 12l6-6" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  imagery: (
    <>
      <path d="M3 8V4h4M17 4h4v4M21 16v4h-4M7 20H3v-4" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  shield: <path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6l8-3z M9 12l2 2 4-4" />,
  chart: <path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6" />,
  document: <path d="M7 3h7l5 5v13H7z M14 3v5h5 M10 13h6M10 17h6" />,
  people: (
    <>
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 14.5c3 0 6 1.8 6 5" />
    </>
  ),
  map: <path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z M9 4v14M15 6v14" />,
  idea: <path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z" />,
};

export function Icon({ name, className = 'h-9 w-9' }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {iconPaths[name]}
    </svg>
  );
}

function Services({ id, d }: { id: string; d: BlockData<'services'> }) {
  return (
    <section id={id} className="py-24 md:py-32 scroll-mt-20">
      <div className="mx-auto max-w-6xl px-6">
        {d.label && <SectionLabel>{d.label}</SectionLabel>}
        {d.title && (
          <h2 className={`${heading} mt-4 max-w-2xl text-3xl md:text-4xl font-bold tracking-tight`} style={{ color: NAVY }}>
            {d.title}
          </h2>
        )}
        {d.items.length > 0 && (
          <div className="mt-16 grid sm:grid-cols-2 gap-px bg-slate-200 border border-slate-200">
            {d.items.map((s, i) => (
              <article key={i} className="group bg-white p-8 md:p-10 transition hover:bg-slate-50">
                <div className="flex items-start justify-between">
                  <Icon name={s.icon} />
                  <span className={`${heading} text-sm font-semibold text-slate-300`}>{String(i + 1).padStart(2, '0')}</span>
                </div>
                <h3 className={`${heading} mt-8 text-xl font-bold`} style={{ color: NAVY }}>
                  {s.title}
                </h3>
                <div className="mt-3 h-0.5 w-10 transition-all group-hover:w-16" style={{ background: ACCENT }} />
                <Paragraphs text={s.text} className="mt-5 leading-relaxed" />
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Steps({ id, d }: { id: string; d: BlockData<'steps'> }) {
  return (
    <section id={id} className="py-24 md:py-32 bg-slate-50 border-y border-slate-100 scroll-mt-20">
      <div className="mx-auto max-w-6xl px-6 grid md:grid-cols-12 gap-12">
        <div className="md:col-span-5">
          {d.label && <SectionLabel>{d.label}</SectionLabel>}
          <h2 className={`${heading} mt-4 text-3xl md:text-4xl font-bold tracking-tight`} style={{ color: NAVY }}>
            {d.title}
          </h2>
          {d.text && <Paragraphs text={d.text} className="mt-6 text-lg leading-relaxed" />}
        </div>
        <div className="md:col-span-7 md:pl-8">
          <ol className="relative border-l-2 border-slate-200">
            {d.steps.map((s, i) => (
              <li key={i} className="relative pl-8 pb-10">
                <span className="absolute -left-[7px] top-1.5 h-3 w-3 rotate-45" style={{ background: ACCENT }} />
                <h3 className={`${heading} text-lg font-bold`} style={{ color: NAVY }}>
                  {s.title}
                </h3>
                <p className="mt-1.5 leading-relaxed">{s.text}</p>
              </li>
            ))}
            {d.finalTitle && (
              <li className="relative pl-8">
                <span className="absolute -left-[9px] top-1 h-4 w-4 rotate-45" style={{ background: NAVY }} />
                <h3 className={`${heading} text-lg font-bold`} style={{ color: NAVY }}>
                  {d.finalTitle}
                </h3>
                {d.finalText && <p className="mt-1.5 leading-relaxed">{d.finalText}</p>}
              </li>
            )}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Focus({ id, d }: { id: string; d: BlockData<'focus'> }) {
  return (
    <section id={id} className="py-24 md:py-32 scroll-mt-20">
      <div className="mx-auto max-w-6xl px-6">
        {d.label && <SectionLabel>{d.label}</SectionLabel>}
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {d.cards.map((c, i) => (
            <div key={i} className="relative overflow-hidden p-8 text-white min-h-56 flex flex-col justify-between" style={{ background: NAVY }}>
              <svg className="absolute inset-0 h-full w-full opacity-[0.12]" aria-hidden>
                <defs>
                  <pattern id={`dots-${id}-${i}`} width="14" height="14" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1.2" fill="#fff" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#dots-${id}-${i})`} />
              </svg>
              <span className={`${heading} relative text-5xl font-bold text-[#8FB4D9]/40`}>{c.tag}</span>
              <h3 className={`${heading} relative mt-10 text-xl font-bold`}>{c.title}</h3>
            </div>
          ))}
          {d.note && (
            <div className="border border-dashed border-slate-300 p-8 flex flex-col justify-end">
              <p className="leading-relaxed">{d.note}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function TextBlock({ id, d }: { id: string; d: BlockData<'text'> }) {
  const navy = d.background === 'navy';
  const center = d.align === 'center';
  return (
    <section id={id} className={`py-20 md:py-28 scroll-mt-20 ${sectionBg[d.background]}`} style={navy ? { background: NAVY } : undefined}>
      {navy && <GridBackdrop />}
      <div className={`relative mx-auto max-w-3xl px-6 ${center ? 'text-center' : ''}`}>
        {d.label && (
          <div className={center ? 'flex justify-center' : ''}>
            <SectionLabel light={navy}>{d.label}</SectionLabel>
          </div>
        )}
        {d.title && (
          <h2 className={`${heading} mt-4 text-3xl md:text-4xl font-bold tracking-tight`} style={{ color: navy ? '#fff' : NAVY }}>
            {d.title}
          </h2>
        )}
        <div className={`mt-6 text-lg leading-relaxed ${navy ? 'text-slate-300' : ''}`}>
          <Paragraphs text={d.body} />
        </div>
      </div>
    </section>
  );
}

function ImageBlock({ id, d, ctx }: { id: string; d: BlockData<'image'>; ctx: RenderCtx }) {
  if (!d.image.id && !ctx.editing) return null;
  const full = d.size === 'full';
  return (
    <section id={id} className={`scroll-mt-20 ${full ? '' : 'py-16 md:py-20'}`}>
      <figure className={full ? '' : 'mx-auto max-w-6xl px-6'}>
        <Img image={d.image} ctx={ctx} className={`w-full object-cover ${full ? 'max-h-[80vh]' : 'rounded-sm'}`} />
        {d.caption && (
          <figcaption className={`mt-3 text-sm text-slate-500 ${full ? 'mx-auto max-w-6xl px-6' : ''}`}>{d.caption}</figcaption>
        )}
      </figure>
    </section>
  );
}

function ImageText({ id, d, ctx }: { id: string; d: BlockData<'imageText'>; ctx: RenderCtx }) {
  const navy = d.background === 'navy';
  return (
    <section id={id} className={`py-20 md:py-28 scroll-mt-20 ${sectionBg[d.background]}`} style={navy ? { background: NAVY } : undefined}>
      {navy && <GridBackdrop />}
      <div className="relative mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-12 items-center">
        <div className={d.side === 'right' ? 'md:order-2' : ''}>
          <Img image={d.image} ctx={ctx} className="w-full rounded-sm object-cover aspect-[4/3]" />
        </div>
        <div>
          {d.label && <SectionLabel light={navy}>{d.label}</SectionLabel>}
          {d.title && (
            <h2 className={`${heading} mt-4 text-3xl md:text-4xl font-bold tracking-tight`} style={{ color: navy ? '#fff' : NAVY }}>
              {d.title}
            </h2>
          )}
          <div className={`mt-6 text-lg leading-relaxed ${navy ? 'text-slate-300' : ''}`}>
            <Paragraphs text={d.text} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Gallery({ id, d, ctx }: { id: string; d: BlockData<'gallery'>; ctx: RenderCtx }) {
  const imgs = d.images.filter((i) => i.image.id);
  if (!imgs.length && !ctx.editing) return null;
  return (
    <section id={id} className="py-20 md:py-28 scroll-mt-20">
      <div className="mx-auto max-w-6xl px-6">
        {d.label && <SectionLabel>{d.label}</SectionLabel>}
        {d.title && (
          <h2 className={`${heading} mt-4 text-3xl md:text-4xl font-bold tracking-tight`} style={{ color: NAVY }}>
            {d.title}
          </h2>
        )}
        {imgs.length === 0 ? (
          <div className="mt-10 border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-400">
            Nog geen foto’s in deze galerij
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4">
            {imgs.map((g, i) => (
              <figure key={i}>
                <Img image={g.image} ctx={ctx} className="w-full aspect-square object-cover rounded-sm" />
                {g.caption && <figcaption className="mt-2 text-sm text-slate-500">{g.caption}</figcaption>}
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Quote({ id, d }: { id: string; d: BlockData<'quote'> }) {
  return (
    <section id={id} className="py-20 md:py-28 bg-slate-50 border-y border-slate-100 scroll-mt-20">
      <figure className="mx-auto max-w-3xl px-6 text-center">
        <svg viewBox="0 0 24 24" className="mx-auto h-10 w-10" fill={ACCENT} aria-hidden>
          <path d="M7 7h4v4H8c0 2 1 3 3 3v2c-3 0-5-2-5-5V7zm8 0h4v4h-3c0 2 1 3 3 3v2c-3 0-5-2-5-5V7z" />
        </svg>
        <blockquote className={`${heading} mt-6 text-2xl md:text-3xl font-semibold leading-snug`} style={{ color: NAVY }}>
          {d.text}
        </blockquote>
        {(d.author || d.role) && (
          <figcaption className="mt-6 text-sm">
            <span className="font-semibold text-slate-800">{d.author}</span>
            {d.role && <span className="text-slate-500"> — {d.role}</span>}
          </figcaption>
        )}
      </figure>
    </section>
  );
}

function Cta({ id, d, ctx }: { id: string; d: BlockData<'cta'>; ctx: RenderCtx }) {
  const navy = d.background === 'navy';
  return (
    <section id={id} className={`py-16 md:py-20 scroll-mt-20 ${sectionBg[d.background]}`} style={navy ? { background: NAVY } : undefined}>
      {navy && <GridBackdrop />}
      <div className="relative mx-auto max-w-6xl px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        <div>
          <h2 className={`${heading} text-2xl md:text-3xl font-bold tracking-tight`} style={{ color: navy ? '#fff' : NAVY }}>
            {d.title}
          </h2>
          {d.text && <p className={`mt-3 text-lg ${navy ? 'text-slate-300' : ''}`}>{d.text}</p>}
        </div>
        <div className={`${heading} text-sm font-semibold shrink-0`}>
          <Btn link={d.button} ctx={ctx} variant={navy ? 'solid' : 'navy'} />
        </div>
      </div>
    </section>
  );
}

function Contact({ id, d, ctx }: { id: string; d: BlockData<'contact'>; ctx: RenderCtx }) {
  return (
    <section id={id} className="relative overflow-hidden text-white scroll-mt-20" style={{ background: NAVY }}>
      <GridBackdrop />
      <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-28 grid md:grid-cols-12 gap-12">
        <div className="md:col-span-5">
          {d.label && (
            <p className={`${heading} text-xs font-semibold tracking-[0.3em] uppercase text-[#8FB4D9]`}>{d.label}</p>
          )}
          <h2 className={`${heading} mt-4 text-3xl md:text-4xl font-bold tracking-tight`}>{d.title}</h2>
          {d.text && <p className="mt-5 max-w-md text-slate-300 leading-relaxed">{d.text}</p>}
        </div>
        <div className={`${heading} md:col-span-7`}>
          <ContactForm disabled={ctx.editing} />
        </div>
      </div>
    </section>
  );
}
