import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth-server';
import { hasAuthConfig } from '@/lib/auth';
import { Sidebar } from './sidebar';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
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
    <div className="min-h-screen flex bg-[#f7f8fa] text-neutral-900">
      <Sidebar email={session.email} />
      <main className="flex-1 min-w-0 p-6 md:p-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
