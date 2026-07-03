import { NextRequest, NextResponse } from 'next/server';
import { assertCron } from '@/lib/cron';
import { runOutreach } from '@/lib/outreach/run';

export const maxDuration = 60;

// Draait periodiek (Vercel Cron): stuurt intro-mails naar nieuwe leads,
// zet automatisch een preview klaar en plant follow-ups in.
export async function GET(req: NextRequest) {
  if (!assertCron(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const summary = await runOutreach();
  return NextResponse.json({ ok: true, ...summary });
}
