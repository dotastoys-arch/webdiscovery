'use client';

import { useRouter } from 'next/navigation';

export function SignOutButton() {
  const router = useRouter();
  async function signOut() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }
  return (
    <button
      onClick={signOut}
      className="w-full text-left rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100"
    >
      Uitloggen
    </button>
  );
}
