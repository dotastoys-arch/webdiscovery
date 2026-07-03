import { NextRequest, NextResponse } from 'next/server';
import { getSql, hasDb } from '@/lib/db';

// Werkende afmeld-endpoint (verplicht in élke mail). Zet het adres op de
// suppressielijst en markeert de lead als afgemeld. GET (link) + POST (one-click).
async function unsubscribe(email: string) {
  if (!hasDb()) return;
  const sql = getSql();
  const e = email.toLowerCase();
  await sql`insert into suppressions (email, reason) values (${e}, 'unsubscribe')
            on conflict (lower(email)) do nothing`;
  await sql`update leads set status = 'unsubscribed', updated_at = now() where lower(email) = ${e}`;
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  if (!email) return NextResponse.json({ error: 'email ontbreekt' }, { status: 400 });
  await unsubscribe(email);
  return new NextResponse(
    `<!doctype html><meta charset="utf-8"><body style="font-family:sans-serif;text-align:center;padding:60px">
     <h1>Je bent afgemeld</h1><p>${email} ontvangt geen mails meer van Webdiscovery.</p></body>`,
    { headers: { 'content-type': 'text/html; charset=utf-8' } }
  );
}

export async function POST(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  if (!email) return NextResponse.json({ error: 'email ontbreekt' }, { status: 400 });
  await unsubscribe(email);
  return NextResponse.json({ ok: true });
}
