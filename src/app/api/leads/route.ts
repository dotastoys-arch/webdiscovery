import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';

// Publieke lead-intake vanaf het offerteformulier. Schrijft via de service-role
// (RLS blokkeert anon) naar `leads` + `events`. Bevat een honeypot tegen spam.
const schema = z.object({
  name: z.string().min(1, 'Naam is verplicht').max(120),
  email: z.string().email('Ongeldig e-mailadres').max(200),
  company: z.string().max(160).optional().or(z.literal('')),
  phone: z.string().max(40).optional().or(z.literal('')),
  website: z.string().max(200).optional().or(z.literal('')),
  message: z.string().max(2000).optional().or(z.literal('')),
  // Honeypot: bots vullen dit; mensen zien het niet.
  nickname: z.string().max(0).optional().or(z.literal('')),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Ongeldige aanvraag' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Ongeldige invoer' },
      { status: 400 }
    );
  }

  const d = parsed.data;
  if (d.nickname) {
    // Honeypot gevuld → doe alsof het lukte, sla niets op.
    return NextResponse.json({ ok: true });
  }

  const email = d.email.toLowerCase();
  const db = createAdminClient();

  const leadValues = {
    company_name: d.company || d.name,
    email,
    phone: d.phone || null,
    website_url: d.website || null,
    has_website: d.website ? true : null,
    source: 'website',
    notes: d.message || null,
    status: 'interested' as const,
  };

  // Bestaat de lead al (op e-mail)? Dan bijwerken i.p.v. dubbel aanmaken.
  const { data: existing } = await db
    .from('leads')
    .select('id')
    .ilike('email', email)
    .maybeSingle();

  let leadId: string | null = null;
  if (existing) {
    leadId = existing.id;
    await db.from('leads').update({ notes: leadValues.notes, status: 'interested' }).eq('id', leadId);
  } else {
    const { data: inserted, error } = await db.from('leads').insert(leadValues).select('id').single();
    if (error) {
      console.error('[leads intake] insert error', error);
      return NextResponse.json({ error: 'Er ging iets mis. Probeer het later opnieuw.' }, { status: 500 });
    }
    leadId = inserted.id;
  }

  await db.from('events').insert({
    lead_id: leadId,
    type: 'website_quote_request',
    data: { name: d.name, message: d.message ?? null },
  });

  return NextResponse.json({ ok: true });
}
