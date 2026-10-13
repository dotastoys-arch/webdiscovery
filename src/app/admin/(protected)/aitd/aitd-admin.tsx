'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Card, CardHeader } from '../ui';

type User = {
  id: number;
  email: string;
  name: string;
  active: boolean;
  locked_until: string | null;
  last_login_at: string | null;
  created_at: string;
};
type Version = { id: number; note: string | null; created_by: string | null; created_at: string };
type AuditItem = { id: number; actor: string; action: string; detail: Record<string, unknown> | null; at: string };

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

async function api(url: string, method = 'GET', body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error ?? 'Er ging iets mis.');
  return j;
}

export function AitdAdmin(props: { locked: boolean; publishedAt: string | null; publishedBy: string | null; updatedBy: string | null }) {
  const [locked, setLocked] = useState(props.locked);
  const [users, setUsers] = useState<User[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [auditLog, setAudit] = useState<AuditItem[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [secret, setSecret] = useState<{ email: string; password: string } | null>(null);

  const load = useCallback(
    () =>
      Promise.all([api('/api/aitd/admin/users'), api('/api/aitd/admin/versions'), api('/api/aitd/admin/audit')])
        .then(([u, v, a]) => {
          setUsers(u.users);
          setVersions(v.versions);
          setAudit(a.items);
        })
        .catch((e: Error) => setMsg({ ok: false, text: e.message })),
    []
  );

  useEffect(() => {
    void load();
  }, [load]);

  async function run(fn: () => Promise<unknown>, okText: string) {
    setMsg(null);
    try {
      await fn();
      setMsg({ ok: true, text: okText });
      load();
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    }
  }

  async function createUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = Object.fromEntries(new FormData(form).entries());
    setMsg(null);
    try {
      const j = await api('/api/aitd/admin/users', 'POST', f);
      setSecret({ email: String(f.email), password: j.password });
      form.reset();
      load();
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    }
  }

  const input = 'rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
  const btn = 'rounded-lg border border-neutral-200 px-2.5 py-1 text-xs font-medium hover:bg-neutral-50';

  return (
    <div className="space-y-6">
      {msg && (
        <div className={`rounded-xl px-4 py-3 text-sm ${msg.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{msg.text}</div>
      )}

      {secret && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm">
          <p className="font-semibold text-amber-900">Tijdelijk wachtwoord voor {secret.email}</p>
          <p className="mt-2">
            <code className="rounded bg-white px-2 py-1 text-base font-semibold tracking-wide">{secret.password}</code>
            <button type="button" className="ml-3 text-xs underline" onClick={() => navigator.clipboard.writeText(secret.password)}>
              Kopiëren
            </button>
          </p>
          <p className="mt-2 text-amber-800">
            Dit wordt maar één keer getoond. Geef het door aan de klant (bij voorkeur telefonisch of via een ander kanaal dan
            het e-mailadres) en vraag de klant het na het inloggen te wijzigen via het rondje rechtsboven → “Wachtwoord wijzigen”.
            Inloggen: <strong>webdiscovery.nl/aitd/beheer</strong>
          </p>
          <button type="button" className="mt-3 text-xs underline" onClick={() => setSecret(null)}>
            Ik heb het genoteerd — verbergen
          </button>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Website</div>
          <div className="mt-2 text-sm text-neutral-600">
            Laatst gepubliceerd: <strong>{fmt(props.publishedAt)}</strong>
            {props.publishedBy && <> door {props.publishedBy}</>}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/aitd/beheer" className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">
              Editor openen (overnemen)
            </Link>
            <a href="/aitd" target="_blank" rel="noopener" className="rounded-lg border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-50">
              Live site ↗
            </a>
          </div>
        </Card>
        <Card className="p-5 md:col-span-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Noodrem</div>
          <p className="mt-2 text-sm text-neutral-600">
            {locked
              ? 'De klant kan nu NIET bewerken of publiceren. Jij kunt alles wel.'
              : 'De klant kan de site zelf bewerken en publiceren. Gaat er iets mis? Vergrendel de klant, zet een eerdere versie terug en ontgrendel daarna.'}
          </p>
          <button
            type="button"
            onClick={() =>
              run(async () => {
                await api('/api/aitd/admin/lock', 'POST', { locked: !locked });
                setLocked(!locked);
              }, !locked ? 'Klant vergrendeld.' : 'Klant ontgrendeld.')
            }
            className={`mt-4 rounded-lg px-3 py-2 text-sm font-medium ${locked ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-amber-500 text-white hover:bg-amber-600'}`}
          >
            {locked ? 'Klant weer laten bewerken' : 'Klant vergrendelen'}
          </button>
        </Card>
      </div>

      <Card>
        <CardHeader title="Klantaccounts" />
        <div className="px-5 pb-5">
          <form onSubmit={createUser} className="mb-4 flex flex-wrap gap-2">
            <input name="name" placeholder="Naam" className={input} maxLength={120} />
            <input name="email" type="email" required placeholder="E-mailadres" className={`${input} min-w-64`} maxLength={200} />
            <button type="submit" className="rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800">
              Account aanmaken
            </button>
          </form>
          {users.length === 0 ? (
            <p className="text-sm text-neutral-400">Nog geen klantaccounts.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-neutral-400">
                  <tr>
                    <th className="py-2 pr-4 font-medium">Account</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                    <th className="py-2 pr-4 font-medium">Laatst ingelogd</th>
                    <th className="py-2 font-medium">Acties</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const blocked = u.locked_until && new Date(u.locked_until) > new Date();
                    return (
                      <tr key={u.id} className="border-t border-neutral-100">
                        <td className="py-3 pr-4">
                          <div className="font-medium text-neutral-800">{u.name || u.email}</div>
                          {u.name && <div className="text-xs text-neutral-400">{u.email}</div>}
                        </td>
                        <td className="py-3 pr-4">
                          {!u.active ? (
                            <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-700">geblokkeerd</span>
                          ) : blocked ? (
                            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">tijdelijk op slot</span>
                          ) : (
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">actief</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-neutral-500">{fmt(u.last_login_at)}</td>
                        <td className="py-3">
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              className={btn}
                              onClick={async () => {
                                if (!confirm(`Nieuw wachtwoord voor ${u.email}? Het oude werkt dan niet meer.`)) return;
                                try {
                                  const j = await api(`/api/aitd/admin/users/${u.id}`, 'PATCH', { action: 'reset' });
                                  setSecret({ email: u.email, password: j.password });
                                  load();
                                } catch (e) {
                                  setMsg({ ok: false, text: (e as Error).message });
                                }
                              }}
                            >
                              Nieuw wachtwoord
                            </button>
                            {blocked && (
                              <button type="button" className={btn} onClick={() => run(() => api(`/api/aitd/admin/users/${u.id}`, 'PATCH', { action: 'unlock' }), 'Account vrijgegeven.')}>
                                Vrijgeven
                              </button>
                            )}
                            <button type="button" className={btn} onClick={() => run(() => api(`/api/aitd/admin/users/${u.id}`, 'PATCH', { action: 'logout' }), 'Klant is overal uitgelogd.')}>
                              Uitloggen
                            </button>
                            <button
                              type="button"
                              className={btn}
                              onClick={() =>
                                run(
                                  () => api(`/api/aitd/admin/users/${u.id}`, 'PATCH', { action: u.active ? 'deactivate' : 'activate' }),
                                  u.active ? 'Account geblokkeerd.' : 'Account weer actief.'
                                )
                              }
                            >
                              {u.active ? 'Blokkeren' : 'Deblokkeren'}
                            </button>
                            <button
                              type="button"
                              className={`${btn} text-red-600`}
                              onClick={() => confirm(`Account ${u.email} verwijderen?`) && run(() => api(`/api/aitd/admin/users/${u.id}`, 'DELETE'), 'Account verwijderd.')}
                            >
                              Verwijderen
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Gepubliceerde versies" />
          <div className="max-h-[28rem] overflow-y-auto px-5 pb-5">
            <ul className="divide-y divide-neutral-100 text-sm">
              {versions.map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div>
                    <div className="font-medium text-neutral-800">Versie {v.id}</div>
                    <div className="text-xs text-neutral-400">
                      {fmt(v.created_at)} · {v.created_by ?? '—'}
                      {v.note && <> · {v.note}</>}
                    </div>
                  </div>
                  <RestoreButtons id={String(v.id)} run={run} btn={btn} />
                </li>
              ))}
              <li className="flex items-center justify-between gap-3 py-2.5">
                <div>
                  <div className="font-medium text-neutral-800">Oorspronkelijke site</div>
                  <div className="text-xs text-neutral-400">Zoals de site door WebDiscovery is opgeleverd</div>
                </div>
                <RestoreButtons id="origineel" run={run} btn={btn} />
              </li>
            </ul>
          </div>
        </Card>

        <Card>
          <CardHeader title="Activiteit" />
          <div className="max-h-[28rem] overflow-y-auto px-5 pb-5">
            {auditLog.length === 0 ? (
              <p className="text-sm text-neutral-400">Nog geen activiteit.</p>
            ) : (
              <ul className="divide-y divide-neutral-100 text-sm">
                {auditLog.map((a) => (
                  <li key={a.id} className="py-2">
                    <span className="text-neutral-800">{a.action}</span>
                    <span className="text-neutral-400"> — {a.actor}</span>
                    <div className="text-xs text-neutral-400">{fmt(a.at)}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function RestoreButtons({
  id,
  run,
  btn,
}: {
  id: string;
  run: (fn: () => Promise<unknown>, ok: string) => void;
  btn: string;
}) {
  return (
    <div className="flex shrink-0 gap-1.5">
      <button
        type="button"
        className={btn}
        title="Zet deze versie terug in de editor; de live site verandert pas na publiceren"
        onClick={() =>
          confirm('Deze versie terugzetten als concept? Niet-gepubliceerde wijzigingen in de editor gaan verloren.') &&
          run(() => api(`/api/aitd/admin/versions/${id}`, 'POST', { mode: 'draft' }), 'Teruggezet als concept. Open de editor om te controleren en te publiceren.')
        }
      >
        Als concept
      </button>
      <button
        type="button"
        className={`${btn} border-indigo-200 text-indigo-700`}
        onClick={() =>
          confirm('Deze versie meteen weer LIVE zetten?') &&
          run(() => api(`/api/aitd/admin/versions/${id}`, 'POST', { mode: 'publish' }), 'Versie teruggezet en gepubliceerd.')
        }
      >
        Live terugzetten
      </button>
    </div>
  );
}
