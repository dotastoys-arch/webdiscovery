import { NextRequest, NextResponse } from 'next/server';
import { getSql, hasDb } from '@/lib/db';
import { createOrderForSite } from '@/lib/orders';
import { config } from '@/lib/config';

// Klant klikt "Deze website bestellen" op de preview: we maken (of hergebruiken)
// een bestelling voor deze site en sturen door naar de betaalpagina.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (!hasDb()) {
    return NextResponse.redirect(`${config.siteUrl}/offerte`);
  }

  const sql = getSql();
  const rows = await sql`select id from generated_sites where preview_slug = ${slug} limit 1`;
  const site = rows[0];
  if (!site) return NextResponse.redirect(`${config.siteUrl}/offerte`);

  try {
    const { orderId } = await createOrderForSite(site.id as string);
    return NextResponse.redirect(`${config.siteUrl}/bestel/${orderId}`);
  } catch (e) {
    console.error('[bestel/start]', e);
    return NextResponse.redirect(`${config.siteUrl}/offerte`);
  }
}
