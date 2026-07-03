import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { getSql } from '@/lib/db';
import { hasVercel, checkDomain, buyDomain, attachDomainToProject } from '@/lib/vercel';

// Registreert (indien nog vrij) + koppelt een domein aan het project en zet de
// bestelling live. Dit is een BETAALDE actie op het Vercel-account: alleen de
// admin (ingelogd) kan dit, en de aanroep bevat de bevestigde prijs.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasVercel()) return NextResponse.json({ error: 'Vercel-koppeling niet ingesteld' }, { status: 400 });

  const { orderId, domain, confirmedPriceCents } = (await req.json().catch(() => ({}))) as {
    orderId?: string;
    domain?: string;
    confirmedPriceCents?: number;
  };
  const d = (domain ?? '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  if (!orderId || !/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(d)) {
    return NextResponse.json({ error: 'Ongeldige invoer' }, { status: 400 });
  }

  const sql = getSql();
  const rows = await sql`select id, status from orders where id = ${orderId} limit 1`;
  const order = rows[0];
  if (!order) return NextResponse.json({ error: 'Bestelling niet gevonden' }, { status: 404 });
  if (!['paid', 'domain_setup', 'delivered'].includes(order.status as string)) {
    return NextResponse.json({ error: 'Bestelling is nog niet betaald' }, { status: 400 });
  }

  try {
    // Verse check: alleen kopen als nog beschikbaar én de prijs klopt met wat de admin zag.
    const check = await checkDomain(d);
    if (check.available) {
      if (check.priceCents == null) {
        return NextResponse.json({ error: 'Prijs onbekend — registreer dit domein handmatig.' }, { status: 400 });
      }
      if (typeof confirmedPriceCents === 'number' && check.priceCents > confirmedPriceCents) {
        return NextResponse.json({ error: 'Prijs is gewijzigd — controleer opnieuw.', priceCents: check.priceCents }, { status: 409 });
      }
      await buyDomain(d, check.priceCents, check.years);
    }
    // Beschikbaar of niet (klant kan al eigenaar zijn): koppel aan project.
    await attachDomainToProject(d);

    await sql`update orders set domain = ${d}, status = 'delivered', updated_at = now() where id = ${orderId}`;
    return NextResponse.json({ ok: true, bought: check.available });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
