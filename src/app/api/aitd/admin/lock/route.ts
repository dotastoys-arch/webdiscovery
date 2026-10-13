import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import { guard } from '@/lib/aitd/api';
import { audit, getSiteRow } from '@/lib/aitd/db';

// Bewerken door de klant tijdelijk uit-/aanzetten (bijv. als er iets misgaat).
export async function POST(req: NextRequest) {
  const g = await guard(req, { mutating: true, adminOnly: true });
  if ('response' in g) return g.response;
  const { locked } = await req.json().catch(() => ({}));
  await getSiteRow(); // zorgt dat de rij bestaat
  await getSql()`update aitd_site set client_locked = ${!!locked} where id = 1`;
  await audit('beheerder', locked ? 'klant vergrendeld' : 'klant ontgrendeld');
  return NextResponse.json({ ok: true });
}
