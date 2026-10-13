import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import { guard, err } from '@/lib/aitd/api';
import { generatePassword, hashPassword } from '@/lib/aitd/auth';
import { audit } from '@/lib/aitd/db';

// Klantaccounts beheren — alleen de beheerder.
export async function GET(req: NextRequest) {
  const g = await guard(req, { adminOnly: true });
  if ('response' in g) return g.response;
  const rows = await getSql()`
    select id, email, name, active, locked_until, last_login_at, created_at from aitd_users order by created_at`;
  return NextResponse.json({ users: rows }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: NextRequest) {
  const g = await guard(req, { mutating: true, adminOnly: true });
  if ('response' in g) return g.response;
  const { email, name } = await req.json().catch(() => ({}));
  const e = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) || e.length > 200) return err(400, 'Vul een geldig e-mailadres in.');
  const password = generatePassword();
  const sql = getSql();
  const exists = await sql`select id from aitd_users where email = ${e}`;
  if (exists[0]) return err(409, 'Dit e-mailadres heeft al een account.');
  await sql`insert into aitd_users (email, name, password_hash) values (${e}, ${typeof name === 'string' ? name.slice(0, 120) : ''}, ${await hashPassword(password)})`;
  await audit('beheerder', 'klantaccount aangemaakt', { email: e });
  // Tijdelijk wachtwoord wordt één keer getoond aan de beheerder.
  return NextResponse.json({ ok: true, password });
}
