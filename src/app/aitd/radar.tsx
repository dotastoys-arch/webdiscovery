'use client';

import { useEffect, useRef, useState } from 'react';

const ACCENT = '#4479AB';
const C = 200; // middelpunt in viewBox-coördinaten

// Flitspunten met hun hoek t.o.v. het middelpunt (graden, met de klok mee vanaf 3 uur).
const blips = [
  { x: 262, y: 142, label: 'FP-01' },
  { x: 128, y: 250, label: 'FP-02' },
  { x: 290, y: 268, label: 'FP-03' },
].map((b) => ({ ...b, angle: (Math.atan2(b.y - C, b.x - C) * 180) / Math.PI }));

const norm = (a: number) => ((a % 360) + 360) % 360;

// Decoratieve radar: de lichtbundel draait rustig rond en volgt de muis bij hover.
// Punten lichten op zodra de bundel erlangs komt.
export function Radar() {
  const svgRef = useRef<SVGSVGElement>(null);
  const target = useRef<number | null>(null);
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let current = 0;
    let last = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const dt = Math.min(now - last, 50);
      last = now;
      if (target.current !== null) {
        // Kortste weg naar de muis, met zachte vertraging.
        const diff = ((target.current - current + 540) % 360) - 180;
        current += diff * Math.min(1, dt / 120);
      } else if (!reduced) {
        current += dt * 0.03; // ~1 omwenteling per 12 s
      }
      current = norm(current);
      setAngle(current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = svgRef.current!.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 400;
    const y = ((e.clientY - r.top) / r.height) * 400;
    // De voorrand van de bundel wijst naar de cursor.
    target.current = norm((Math.atan2(y - C, x - C) * 180) / Math.PI);
  };

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 400 400"
      className="w-full max-w-md ml-auto cursor-crosshair touch-none"
      onPointerMove={onMove}
      onPointerLeave={() => (target.current = null)}
      aria-hidden
    >
      <defs>
        <linearGradient id="sweep" x1="1" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={ACCENT} stopOpacity="0.65" />
          <stop offset="1" stopColor={ACCENT} stopOpacity="0" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="#8FB4D9" strokeOpacity="0.35">
        <circle cx={C} cy={C} r="60" />
        <circle cx={C} cy={C} r="110" />
        <circle cx={C} cy={C} r="160" strokeDasharray="2 6" />
        <path d="M200 20v360M20 200h360" strokeOpacity="0.2" />
      </g>
      <g transform={`rotate(${angle} ${C} ${C})`}>
        <path d="M200 200 L313 87 A160 160 0 0 1 360 200 Z" fill="url(#sweep)" />
        <path d="M200 200 L360 200" stroke="#8FB4D9" strokeOpacity="0.8" strokeWidth="1.5" />
      </g>
      {blips.map((b) => {
        // Hoe recent is de bundel gepasseerd? 1 = net geraakt, 0 = lang geleden.
        const since = norm(angle - b.angle);
        const glow = since < 90 ? 1 - since / 90 : 0;
        return (
          <g key={b.label}>
            <circle cx={b.x} cy={b.y} r={14 + glow * 10} fill={ACCENT} fillOpacity={glow * 0.35} />
            <rect
              x={b.x - 5}
              y={b.y - 5}
              width="10"
              height="10"
              transform={`rotate(45 ${b.x} ${b.y})`}
              fill="#fff"
            />
            <circle cx={b.x} cy={b.y} r="14" fill="none" stroke="#fff" strokeOpacity={0.4 + glow * 0.6} />
            <text
              x={b.x + 20}
              y={b.y + 4}
              fill="#8FB4D9"
              fillOpacity={0.6 + glow * 0.4}
              fontSize="11"
              letterSpacing="2"
              fontFamily="monospace"
            >
              {b.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
