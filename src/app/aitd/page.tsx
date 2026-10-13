import type { Metadata } from 'next';
import { AitdMark } from './logo';

// One-pager voor klant AITD Consulting BV (Engelstalig). Wordt later ook via
// aitdconsulting.eu geserveerd (zie host-routing in src/proxy.ts).

// Fonts komen uit de root-layout (Plus Jakarta Sans + Hanken Grotesk), zodat
// deze pagina geen extra Google Fonts-download nodig heeft tijdens de build.
const heading = { className: 'font-[family-name:var(--font-jakarta)]' };
const text = { className: 'font-[family-name:var(--font-body)]' };

const CONTACT_EMAIL = 'info@aitdconsulting.eu';

export const metadata: Metadata = {
  title: 'AITD Consulting — Geopolitical analysis & strategic foresight',
  description:
    'AITD Consulting provides tailored geopolitical analysis, scenario modelling, situational awareness and imagery analysis, with a focus on MENA and the Horn of Africa.',
  icons: { icon: '/aitd/icon.svg' },
};

const NAVY = '#0B2E52';
const ACCENT = '#4479AB';

const services = [
  {
    t: 'Geopolitical analysis',
    d: 'Fusing information from open sources, informed interlocutors and field visits, we provide tailored reporting with client-specific analysis that offers strategic foresight. We focus on MENA and the Horn of Africa but can leverage expertise across other geographical and subject-matter areas.',
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
      </>
    ),
  },
  {
    t: 'Scenario modelling',
    d: 'Using structured analytical techniques, we anticipate possible outcomes and identify warnings and indicators that inform strategy and allow contingency planning.',
    icon: (
      <>
        <path d="M4 12h5l3-6M9 12l3 6M12 6h8M12 18h8M12 12h8" />
        <circle cx="4" cy="12" r="1.5" />
      </>
    ),
  },
  {
    t: 'Situational awareness',
    d: 'We provide active monitoring of flash points and crisis events with the ability to provide rapid threat assessments.',
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <path d="M12 12l6-6" />
        <circle cx="12" cy="12" r="1" />
      </>
    ),
  },
  {
    t: 'Imagery analysis',
    d: 'We use tactical imagery analysis and geolocation to support broader assessments and can provide stand-alone analytical products.',
    icon: (
      <>
        <path d="M3 8V4h4M17 4h4v4M21 16v4h-4M7 20H3v-4" />
        <path d="M12 8v8M8 12h8" />
      </>
    ),
  },
];

const sources = [
  { t: 'Open sources', d: 'Systematic collection and verification of publicly available information.' },
  { t: 'Informed interlocutors', d: 'Insight from trusted contacts with direct knowledge of the ground.' },
  { t: 'Field visits', d: 'First-hand observation where it matters most.' },
];

export default function AitdPage() {
  return (
    <div className={`${text.className} flex-1 bg-white text-slate-700`}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="mx-auto max-w-6xl px-6 h-18 py-4 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-3" aria-label="AITD Consulting — home">
            <AitdMark className="h-7 w-auto" />
            <span
              className={`${heading.className} hidden sm:inline text-[11px] font-semibold tracking-[0.35em] uppercase`}
              style={{ color: NAVY }}
            >
              Consulting
            </span>
          </a>
          <nav className={`${heading.className} flex items-center gap-8 text-sm font-medium text-slate-600`}>
            <a href="#services" className="hidden md:inline hover:text-[#0B2E52]">Services</a>
            <a href="#approach" className="hidden md:inline hover:text-[#0B2E52]">Approach</a>
            <a href="#focus" className="hidden md:inline hover:text-[#0B2E52]">Focus</a>
            <a
              href="#contact"
              className="rounded-sm px-5 py-2.5 text-white transition hover:opacity-90"
              style={{ background: NAVY }}
            >
              Contact
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="relative overflow-hidden text-white" style={{ background: NAVY }}>
        <GridBackdrop />
        <div className="relative mx-auto max-w-6xl px-6 pt-24 pb-28 md:pt-32 md:pb-36 grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7">
            <p className={`${heading.className} text-xs font-semibold tracking-[0.3em] uppercase text-[#8FB4D9]`}>
              Geopolitical risk &amp; intelligence advisory
            </p>
            <h1 className={`${heading.className} mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight`}>
              Strategic foresight.
              <br />
              <span className="text-[#8FB4D9]">All in the detail.</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-slate-300">
              Tailored, client-specific analysis that helps you anticipate what comes next — built on
              open sources, informed interlocutors and field visits.
            </p>
            <div className={`${heading.className} mt-10 flex flex-wrap gap-4 text-sm font-semibold`}>
              <a href="#contact" className="rounded-sm bg-white px-6 py-3.5 transition hover:bg-slate-100" style={{ color: NAVY }}>
                Discuss your requirements
              </a>
              <a href="#services" className="rounded-sm border border-white/30 px-6 py-3.5 transition hover:border-white/70">
                Our services
              </a>
            </div>
          </div>
          <div className="md:col-span-5 hidden md:block">
            <Radar />
          </div>
        </div>
        <div className="relative border-t border-white/10">
          <div className={`${heading.className} mx-auto max-w-6xl px-6 py-5 flex flex-wrap gap-x-10 gap-y-2 text-[11px] font-semibold tracking-[0.25em] uppercase text-slate-400`}>
            <span><span className="text-[#8FB4D9]">Focus</span>&nbsp;&nbsp;Middle East &amp; North Africa</span>
            <span>Horn of Africa</span>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <SectionLabel>What we do</SectionLabel>
          <h2 className={`${heading.className} mt-4 max-w-2xl text-3xl md:text-4xl font-bold tracking-tight`} style={{ color: NAVY }}>
            Four disciplines, one aim: decisions informed by the full picture.
          </h2>
          <div className="mt-16 grid sm:grid-cols-2 gap-px bg-slate-200 border border-slate-200">
            {services.map((s, i) => (
              <article key={s.t} className="group bg-white p-8 md:p-10 transition hover:bg-slate-50">
                <div className="flex items-start justify-between">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-9 w-9"
                    fill="none"
                    stroke={ACCENT}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    {s.icon}
                  </svg>
                  <span className={`${heading.className} text-sm font-semibold text-slate-300`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className={`${heading.className} mt-8 text-xl font-bold`} style={{ color: NAVY }}>
                  {s.t}
                </h3>
                <div className="mt-3 h-0.5 w-10 transition-all group-hover:w-16" style={{ background: ACCENT }} />
                <p className="mt-5 leading-relaxed">{s.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Approach */}
      <section id="approach" className="py-24 md:py-32 bg-slate-50 border-y border-slate-100">
        <div className="mx-auto max-w-6xl px-6 grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <SectionLabel>Our approach</SectionLabel>
            <h2 className={`${heading.className} mt-4 text-3xl md:text-4xl font-bold tracking-tight`} style={{ color: NAVY }}>
              Multiple sources. One clear assessment.
            </h2>
            <p className="mt-6 text-lg leading-relaxed">
              We fuse information from different streams and apply structured analytical techniques, so every
              product is tailored to your questions — not generic reporting.
            </p>
          </div>
          <div className="md:col-span-7 md:pl-8">
            <ol className="relative border-l-2 border-slate-200">
              {sources.map((s) => (
                <li key={s.t} className="relative pl-8 pb-10">
                  <span className="absolute -left-[7px] top-1.5 h-3 w-3 rotate-45" style={{ background: ACCENT }} />
                  <h3 className={`${heading.className} text-lg font-bold`} style={{ color: NAVY }}>{s.t}</h3>
                  <p className="mt-1.5 leading-relaxed">{s.d}</p>
                </li>
              ))}
              <li className="relative pl-8">
                <span className="absolute -left-[9px] top-1 h-4 w-4 rotate-45" style={{ background: NAVY }} />
                <h3 className={`${heading.className} text-lg font-bold`} style={{ color: NAVY }}>
                  Tailored analysis &amp; strategic foresight
                </h3>
                <p className="mt-1.5 leading-relaxed">
                  Client-specific reporting, scenarios with warnings and indicators, and rapid threat assessments
                  when events unfold.
                </p>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* Focus */}
      <section id="focus" className="py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <SectionLabel>Regional focus</SectionLabel>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            <FocusCard title="Middle East & North Africa" tag="MENA" />
            <FocusCard title="Horn of Africa" tag="HoA" />
            <div className="border border-dashed border-slate-300 p-8 flex flex-col justify-end">
              <p className="leading-relaxed">
                Beyond our core regions, we can leverage expertise across other geographical and subject-matter
                areas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="relative overflow-hidden text-white" style={{ background: NAVY }}>
        <GridBackdrop />
        <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-28 grid md:grid-cols-2 gap-10 items-end">
          <div>
            <p className={`${heading.className} text-xs font-semibold tracking-[0.3em] uppercase text-[#8FB4D9]`}>Contact</p>
            <h2 className={`${heading.className} mt-4 text-3xl md:text-4xl font-bold tracking-tight`}>
              Facing a complex environment? Let&apos;s talk.
            </h2>
            <p className="mt-5 max-w-md text-slate-300 leading-relaxed">
              Tell us about your requirements and we will propose an analytical product that fits — in confidence.
            </p>
          </div>
          <div className="md:text-right">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className={`${heading.className} inline-block rounded-sm bg-white px-7 py-4 text-sm font-semibold transition hover:bg-slate-100`}
              style={{ color: NAVY }}
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-3">
            <AitdMark className="h-5 w-auto" />
            <span>AITD Consulting BV</span>
          </div>
          <span className={`${heading.className} text-[11px] font-semibold tracking-[0.3em] uppercase`} style={{ color: ACCENT }}>
            All in the detail
          </span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className={`${heading.className} flex items-center gap-3 text-xs font-semibold tracking-[0.3em] uppercase`} style={{ color: ACCENT }}>
      <span className="h-px w-8" style={{ background: ACCENT }} />
      {children}
    </p>
  );
}

function FocusCard({ title, tag }: { title: string; tag: string }) {
  return (
    <div className="relative overflow-hidden p-8 text-white min-h-56 flex flex-col justify-between" style={{ background: NAVY }}>
      <svg className="absolute inset-0 h-full w-full opacity-[0.12]" aria-hidden>
        <defs>
          <pattern id={`dots-${tag}`} width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="#fff" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#dots-${tag})`} />
      </svg>
      <span className={`${heading.className} relative text-5xl font-bold text-[#8FB4D9]/40`}>{tag}</span>
      <h3 className={`${heading.className} relative mt-10 text-xl font-bold`}>{title}</h3>
    </div>
  );
}

// Subtiel coördinatenraster als achtergrond.
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

// Decoratief "monitoring"-beeld in de hero.
function Radar() {
  return (
    <svg viewBox="0 0 400 400" className="w-full max-w-md ml-auto" aria-hidden>
      <g fill="none" stroke="#8FB4D9" strokeOpacity="0.35">
        <circle cx="200" cy="200" r="60" />
        <circle cx="200" cy="200" r="110" />
        <circle cx="200" cy="200" r="160" strokeDasharray="2 6" />
        <path d="M200 20v360M20 200h360" strokeOpacity="0.2" />
      </g>
      <path d="M200 200 L313 87 A160 160 0 0 1 360 200 Z" fill="url(#sweep)" />
      <defs>
        <linearGradient id="sweep" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={ACCENT} stopOpacity="0.55" />
          <stop offset="1" stopColor={ACCENT} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[
        [262, 142, 'FP-01'],
        [128, 250, 'FP-02'],
        [290, 268, 'FP-03'],
      ].map(([x, y, l]) => (
        <g key={l as string}>
          <rect x={(x as number) - 5} y={(y as number) - 5} width="10" height="10" transform={`rotate(45 ${x} ${y})`} fill="#fff" />
          <circle cx={x as number} cy={y as number} r="14" fill="none" stroke="#fff" strokeOpacity="0.4" />
          <text x={(x as number) + 20} y={(y as number) + 4} fill="#8FB4D9" fontSize="11" letterSpacing="2" fontFamily="monospace">
            {l}
          </text>
        </g>
      ))}
    </svg>
  );
}
