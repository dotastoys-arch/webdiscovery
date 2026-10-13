import type { Metadata } from 'next';

// Beheeromgeving van de AITD-site: nooit indexeren.
export const metadata: Metadata = {
  title: 'Beheer — AITD Consulting',
  robots: { index: false, follow: false },
  icons: { icon: '/aitd/icon.svg' },
};

export default function BeheerLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex-1 flex flex-col font-[family-name:var(--font-jakarta)]">{children}</div>;
}
