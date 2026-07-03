import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Werkende afmeld-endpoint (verplicht in élke mail). Zet het adres op de
// suppressielijst en markeert de lead als afgemeld. Werkt via GET (link in
// mail) en POST (one-click unsubscribe volgens RFC 8058).
async function unsubscribe(email: string) {
  const db = createAdminClient();
  await db.from('suppressions').upsert(
    { email: email.toLowerCase(), reason: 'unsubscribe' },
    { onConflict: 'email' }
  );
  await db.from('leads').update({ status: 'unsubscribed' }).ilike('email', email);
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
