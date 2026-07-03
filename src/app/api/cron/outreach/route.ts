import { NextRequest, NextResponse } from 'next/server';
import { assertCron } from '@/lib/cron';

// FASE 2 — Outreach-engine.
// Draait periodiek (Vercel Cron). Straks:
//   1. Nieuwe leads met een e-mailadres selecteren (status 'new'/'queued').
//   2. Dagelijkse verzendlimiet per campagne respecteren (deliverability).
//   3. Intro-mail renderen uit email_templates + sendEmail().
//   4. Follow-up-taken inplannen in `tasks` (send_preview, followup_2day).
//   5. Lead-status bijwerken naar 'contacted'.
export async function GET(req: NextRequest) {
  if (!assertCron(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // TODO(fase 2): implementeer verzendlogica.
  return NextResponse.json({ ok: true, phase: 'stub', processed: 0 });
}
