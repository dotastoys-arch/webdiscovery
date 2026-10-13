import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import { guard, err } from '@/lib/aitd/api';
import { hashPassword, loginClient, clientIp, passwordProblem, CLIENT_COOKIE, clientCookieOptions } from '@/lib/aitd/auth';
import { audit } from '@/lib/aitd/db';

// Klant wijzigt eigen wachtwoord. Daarna worden andere sessies ongeldig.
export async function POST(req: NextRequest) {
  const g = await guard(req, { mutating: true });
  if ('response' in g) return g.response;
  if (g.editor.kind !== 'client') return err(400, 'Alleen voor klantaccounts.');
  const { current, next } = await req.json().catch(() => ({}));
  if (typeof current !== 'string' || typeof next !== 'string') return err(400, 'Vul beide velden in.');
  const problem = passwordProblem(next);
  if (problem) return err(400, problem);

  // Huidig wachtwoord controleren via de normale login (incl. rate-limits).
  const check = await loginClient(g.editor.email, current, clientIp(req));
  if (!check.ok) return err(check.status === 401 ? 400 : check.status, check.status === 401 ? 'Je huidige wachtwoord klopt niet.' : check.error);

  const sql = getSql();
  const rows = await sql`
    update aitd_users set password_hash = ${await hashPassword(next)}, session_version = session_version + 1
    where id = ${g.editor.userId} returning email`;
  await audit(`klant:${g.editor.email}`, 'wachtwoord gewijzigd');

  // Direct opnieuw inloggen met het nieuwe wachtwoord (nieuwe sessie).
  const fresh = await loginClient(rows[0].email as string, next, clientIp(req));
  const res = NextResponse.json({ ok: true });
  if (fresh.ok) res.cookies.set(CLIENT_COOKIE, fresh.token, clientCookieOptions);
  return res;
}
