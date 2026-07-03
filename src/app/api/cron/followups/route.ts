import { NextRequest, NextResponse } from 'next/server';
import { assertCron } from '@/lib/cron';

// FASE 2 — Follow-up-verwerker.
// Draait periodiek (Vercel Cron). Straks:
//   1. Openstaande taken uit `tasks` ophalen waarvan due_at <= nu.
//   2. Per type de juiste mail sturen (followup_2day, followup_final).
//   3. "Heeft de lead de preview bekeken?" bepalen via messages.opened_at.
//   4. Taken afronden en lead-status bijwerken.
export async function GET(req: NextRequest) {
  if (!assertCron(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // TODO(fase 2): verwerk openstaande follow-up-taken.
  return NextResponse.json({ ok: true, phase: 'stub', processed: 0 });
}
