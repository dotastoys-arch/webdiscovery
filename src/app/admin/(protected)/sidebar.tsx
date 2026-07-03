'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogoMark } from '@/components/logo';
import { Icon, icons } from './icons';

const groups: { label: string; items: { href: string; icon: string; label: string }[] }[] = [
  { label: 'Command', items: [{ href: '/admin', icon: 'overview', label: 'Overzicht' }] },
  {
    label: 'Acquisitie',
    items: [
      { href: '/admin/discovery', icon: 'discovery', label: 'Discovery' },
      { href: '/admin/leads', icon: 'leads', label: 'Leads' },
    ],
  },
  {
    label: 'Outreach',
    items: [
      { href: '/admin/campaigns', icon: 'campaigns', label: 'Campagnes' },
      { href: '/admin/emails', icon: 'emails', label: 'Berichten' },
    ],
  },
  {
    label: 'Sales',
    items: [
      { href: '/admin/websites', icon: 'monitor', label: 'Websites' },
      { href: '/admin/orders', icon: 'orders', label: 'Bestellingen' },
    ],
  },
  { label: 'Platform', items: [{ href: '/admin/settings', icon: 'settings', label: 'Instellingen' }] },
];

export function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <aside className="w-60 shrink-0 border-r border-neutral-200/80 bg-white flex flex-col h-screen sticky top-0">
      <div className="px-5 h-16 flex items-center gap-2.5 border-b border-neutral-100">
        <span className="text-neutral-900">
          <LogoMark className="w-7 h-7" />
        </span>
        <div>
          <div className="font-semibold text-sm leading-tight text-neutral-900">WebDiscovery</div>
          <div className="text-[11px] text-neutral-400 leading-tight">Command Center</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {groups.map((g) => (
          <div key={g.label}>
            <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
              {g.label}
            </div>
            <div className="space-y-0.5">
              {g.items.map((item) => {
                const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                      active
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                    }`}
                  >
                    <Icon path={icons[item.icon]} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-neutral-100 p-3">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold uppercase">
            {email.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-neutral-800 truncate">{email}</div>
            <button onClick={signOut} className="text-[11px] text-neutral-400 hover:text-neutral-700">
              Uitloggen
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
