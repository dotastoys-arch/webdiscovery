import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { hasVercel, checkDomain } from '@/lib/vercel';

// Checkt beschikbaarheid + jaarprijs van een domein (geen aankoop).
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasVercel()) return NextResponse.json({ error: 'Vercel-koppeling niet ingesteld' }, { status: 400 });

  const { domain } = (await req.json().catch(() => ({}))) as { domain?: string };
  const d = (domain ?? '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(d)) {
    return NextResponse.json({ error: 'Ongeldige domeinnaam' }, { status: 400 });
  }

  try {
    const result = await checkDomain(d);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
