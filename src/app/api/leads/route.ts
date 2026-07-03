import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSql, hasDb } from '@/lib/db';

// Publieke lead-intake vanaf het offerteformulier. Schrijft naar Neon.
const schema = z.object({
  name: z.string().min(1, 'Naam is verplicht').max(120),
  email: z.string().email('Ongeldig e-mailadres').max(200),
  company: z.string().max(160).optional().or(z.literal('')),
  phone: z.string().max(40).optional().or(z.literal('')),
  website: z.string().max(200).optional().or(z.literal('')),
  message: z.string().max(2000).optional().or(z.literal('')),
  nickname: z.string().max(0).optional().or(z.literal('')), // honeypot
});

export async function POST(req: NextRequest) {
  if (!hasDb()) {
    return NextResponse.json({ error: 'Database nog niet gekoppeld.' }, { status: 503 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Ongeldige invoer' },
      { status: 400 }
    );
  }

  const d = parsed.data;
  if (d.nickname) return NextResponse.json({ ok: true }); // honeypot gevuld

  const email = d.email.toLowerCase();
  const sql = getSql();

  try {
    const existing = await sql`select id from leads where lower(email) = ${email} limit 1`;
    let leadId: string;

    if (existing[0]) {
      leadId = existing[0].id as string;
      await sql`update leads set notes = ${d.message || null}, status = 'interested', updated_at = now() where id = ${leadId}`;
    } else {
      const ins = await sql`
        insert into leads (company_name, email, phone, website_url, has_website, source, notes, status)
        values (${d.company || d.name}, ${email}, ${d.phone || null}, ${d.website || null},
                ${d.website ? true : null}, 'website', ${d.message || null}, 'interested')
        returning id`;
      leadId = ins[0].id as string;
    }

    await sql`
      insert into events (lead_id, type, data)
      values (${leadId}, 'website_quote_request', ${JSON.stringify({ name: d.name, message: d.message ?? null })}::jsonb)`;

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[leads intake]', e);
    return NextResponse.json({ error: 'Er ging iets mis. Probeer het later opnieuw.' }, { status: 500 });
  }
}
