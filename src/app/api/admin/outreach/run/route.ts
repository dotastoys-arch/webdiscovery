import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { runOutreach } from '@/lib/outreach/run';

export const maxDuration = 60;

// Handmatig de outreach draaien vanuit de admin (test/kickstart).
export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const summary = await runOutreach();
  return NextResponse.json({ ok: true, ...summary });
}
