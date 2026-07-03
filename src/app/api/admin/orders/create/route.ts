import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { createOrderForSite } from '@/lib/orders';
import { config } from '@/lib/config';

// Maakt een bestelling voor een gegenereerde site en geeft de betaallink terug.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { siteId } = await req.json().catch(() => ({}));
  if (!siteId) return NextResponse.json({ error: 'siteId ontbreekt' }, { status: 400 });

  try {
    const { orderId } = await createOrderForSite(siteId);
    return NextResponse.json({ ok: true, orderId, bestelUrl: `${config.siteUrl}/bestel/${orderId}` });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Onbekende fout';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
