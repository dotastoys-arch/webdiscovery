'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? 'Inloggen mislukt.');
      return;
    }
    router.push(params.get('next') ?? '/admin');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-white rounded-xl border border-neutral-200 p-8 shadow-sm"
      >
        <h1 className="text-xl font-semibold mb-1">Webdiscovery admin</h1>
        <p className="text-sm text-neutral-500 mb-6">Log in om verder te gaan.</p>

        <label className="block text-sm font-medium mb-1">E-mail</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          placeholder="jij@webdiscovery.nl"
        />

        <label className="block text-sm font-medium mb-1">Wachtwoord</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-neutral-900 text-white py-2 text-sm font-medium hover:bg-neutral-800 disabled:opacity-50"
        >
          {loading ? 'Bezig…' : 'Inloggen'}
        </button>
      </form>
    </div>
  );
}
