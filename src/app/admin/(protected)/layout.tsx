import Link from 'next/link';
import { redirect } from 'next/navigation';
import { hasAuthConfig } from '@/lib/auth';
import { getSession } from '@/lib/auth-server';
import { SignOutButton } from './signout-button';

const nav = [
  { href: '/admin', label: 'Overzicht' },
  { href: '/admin/discovery', label: 'Discovery' },
  { href: '/admin/leads', label: 'Leads' },
  { href: '/admin/campaigns', label: 'Campagnes' },
  { href: '/admin/emails', label: 'Berichten' },
  { href: '/admin/orders', label: 'Bestellingen' },
  { href: '/admin/settings', label: 'Instellingen' },
];

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  // Zonder auth-config kan de admin niet draaien — toon een hint i.p.v. crashen.
  if (!hasAuthConfig()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
        <div className="max-w-md text-center">
          <h1 className="text-lg font-semibold mb-2">Admin nog niet geconfigureerd</h1>
          <p className="text-sm text-neutral-600">
            Zet <code>AUTH_SECRET</code>, <code>ADMIN_EMAIL</code>, <code>ADMIN_PASSWORD</code> en{' '}
            <code>DATABASE_URL</code> (Neon) in <code>.env.local</code> (zie{' '}
            <code>.env.local.example</code>). Daarna werkt de admin.
          </p>
        </div>
      </div>
    );
  }

  const session = await getSession();
  if (!session) redirect('/admin/login');

  return (
    <div className="min-h-screen flex bg-neutral-50 text-neutral-900">
      <aside className="w-56 shrink-0 border-r border-neutral-200 bg-white flex flex-col">
        <div className="px-5 py-5 border-b border-neutral-200">
          <div className="font-semibold">Webdiscovery</div>
          <div className="text-xs text-neutral-500">admin</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-neutral-200">
          <div className="px-3 py-1 text-xs text-neutral-500 truncate">{session.email}</div>
          <SignOutButton />
        </div>
      </aside>
      <main className="flex-1 min-w-0 p-8">{children}</main>
    </div>
  );
}
