import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { runDailyDiscovery } from '@/lib/discovery/daily';

export const maxDuration = 300;

// Handmatig de dagelijkse discovery draaien vanuit de admin.
export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const summary = await runDailyDiscovery();
  return NextResponse.json({ ok: true, ...summary });
}
