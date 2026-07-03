import { NextRequest, NextResponse } from 'next/server';
import { assertCron } from '@/lib/cron';
import { runFollowups } from '@/lib/outreach/followups';

export const maxDuration = 60;

// Draait periodiek (Vercel Cron): verstuurt follow-up-mails voor leads die
// 2 dagen geleden hun preview kregen en nog niet reageerden.
export async function GET(req: NextRequest) {
  if (!assertCron(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const summary = await runFollowups();
  return NextResponse.json({ ok: true, ...summary });
}
