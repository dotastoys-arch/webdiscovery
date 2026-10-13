import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';

// Contactformulier van de AITD-one-pager (/aitd). Stuurt het bericht door naar
// het adres in AITD_CONTACT_TO (Vercel env), zodat dat nergens op de site staat.
const schema = z.object({
  name: z.string().trim().min(1, 'Please enter your name.').max(120),
  email: z.string().trim().email('Please enter a valid email address.').max(200),
  organisation: z.string().trim().max(160).optional().or(z.literal('')),
  message: z.string().trim().min(10, 'Please tell us a little more (at least 10 characters).').max(4000),
  nickname: z.string().max(0).optional().or(z.literal('')), // honeypot
});

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input.' }, { status: 400 });
  }

  const d = parsed.data;
  if (d.nickname) return NextResponse.json({ ok: true }); // honeypot gevuld → stil negeren

  const to = process.env.AITD_CONTACT_TO;
  if (!process.env.RESEND_API_KEY || !to) {
    console.error('[aitd-contact] RESEND_API_KEY of AITD_CONTACT_TO ontbreekt');
    return NextResponse.json({ error: 'The form is temporarily unavailable. Please try again later.' }, { status: 503 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.AITD_MAIL_FROM ?? 'AITD Consulting website <hallo@mail.webdiscovery.nl>';
  const org = d.organisation || '—';

  const { error } = await resend.emails.send({
    from,
    to: to.split(',').map((s) => s.trim()),
    replyTo: d.email,
    subject: `Website enquiry from ${d.name}${d.organisation ? ` (${d.organisation})` : ''}`,
    text: `Name: ${d.name}\nOrganisation: ${org}\nEmail: ${d.email}\n\n${d.message}`,
    html: `<p><strong>Name:</strong> ${esc(d.name)}<br><strong>Organisation:</strong> ${esc(org)}<br><strong>Email:</strong> ${esc(d.email)}</p><p style="white-space:pre-wrap">${esc(d.message)}</p><p style="color:#888;font-size:12px">Sent via the contact form on the AITD Consulting website. Reply to this email to answer directly.</p>`,
  });

  if (error) {
    console.error('[aitd-contact] Resend fout', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again later.' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
