import { NextRequest, NextResponse } from 'next/server';
import { assertCron } from '@/lib/cron';
import { runDailyDiscovery } from '@/lib/discovery/daily';

export const maxDuration = 300;

// Draait dagelijks (Vercel Cron): zoekt ~20 nieuwe bedrijven, start bij Den Haag
// en breidt vanzelf uit naar meer branches/plaatsen.
export async function GET(req: NextRequest) {
  if (!assertCron(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const summary = await runDailyDiscovery();
  return NextResponse.json({ ok: true, ...summary });
}
