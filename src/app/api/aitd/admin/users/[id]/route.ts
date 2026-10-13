import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import { guard, err } from '@/lib/aitd/api';
import { generatePassword, hashPassword } from '@/lib/aitd/auth';
import { audit } from '@/lib/aitd/db';

type Ctx = { params: Promise<{ id: string }> };

// Acties op een klantaccount: wachtwoord resetten, (de)activeren, deblokkeren.
// Elke actie behalve 'unlock' maakt bestaande sessies van de klant direct ongeldig.
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const g = await guard(req, { mutating: true, adminOnly: true });
  if ('response' in g) return g.response;
  const id = Number((await params).id);
  const { action } = await req.json().catch(() => ({}));
  const sql = getSql();
  const rows = await sql`select email from aitd_users where id = ${id}`;
  if (!rows[0]) return err(404, 'Account niet gevonden.');
  const email = rows[0].email as string;

  if (action === 'reset') {
    const password = generatePassword();
    await sql`update aitd_users set password_hash = ${await hashPassword(password)}, session_version = session_version + 1,
              failed_attempts = 0, locked_until = null where id = ${id}`;
    await audit('beheerder', 'wachtwoord gereset', { email });
    return NextResponse.json({ ok: true, password });
  }
  if (action === 'deactivate' || action === 'activate') {
    const active = action === 'activate';
    await sql`update aitd_users set active = ${active}, session_version = session_version + 1 where id = ${id}`;
    await audit('beheerder', active ? 'account geactiveerd' : 'account geblokkeerd', { email });
    return NextResponse.json({ ok: true });
  }
  if (action === 'unlock') {
    await sql`update aitd_users set failed_attempts = 0, locked_until = null where id = ${id}`;
    await audit('beheerder', 'account gedeblokkeerd', { email });
    return NextResponse.json({ ok: true });
  }
  if (action === 'logout') {
    await sql`update aitd_users set session_version = session_version + 1 where id = ${id}`;
    await audit('beheerder', 'klant uitgelogd', { email });
    return NextResponse.json({ ok: true });
  }
  return err(400, 'Onbekende actie.');
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const g = await guard(req, { mutating: true, adminOnly: true });
  if ('response' in g) return g.response;
  const id = Number((await params).id);
  const rows = await getSql()`delete from aitd_users where id = ${id} returning email`;
  if (!rows[0]) return err(404, 'Account niet gevonden.');
  await audit('beheerder', 'klantaccount verwijderd', { email: rows[0].email });
  return NextResponse.json({ ok: true });
}
