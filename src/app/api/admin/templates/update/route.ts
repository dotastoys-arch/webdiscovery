import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { getSql } from '@/lib/db';

// Werkt een mail-sjabloon bij (onderwerp, tekst en actief-status).
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { id, subject, body_html, body_text, is_active } = (await req.json().catch(() => ({}))) as {
    id?: string;
    subject?: string;
    body_html?: string;
    body_text?: string;
    is_active?: boolean;
  };
  if (!id || subject === undefined || body_html === undefined) {
    return NextResponse.json({ error: 'ongeldige invoer' }, { status: 400 });
  }

  const sql = getSql();
  await sql`
    update email_templates
    set subject = ${subject},
        body_html = ${body_html},
        body_text = ${body_text || null},
        is_active = ${is_active ?? true}
    where id = ${id}`;

  return NextResponse.json({ ok: true });
}
