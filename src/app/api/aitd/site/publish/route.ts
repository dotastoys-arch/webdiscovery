import { NextRequest, NextResponse } from 'next/server';
import { guard, err, actorOf } from '@/lib/aitd/api';
import { getSiteRow, publishDraft, audit } from '@/lib/aitd/db';

// Concept live zetten. Elke publicatie wordt bewaard als versie (terugzetbaar door de beheerder).
export async function POST(req: NextRequest) {
  const g = await guard(req, { mutating: true });
  if ('response' in g) return g.response;
  const row = await getSiteRow();
  if (row.clientLocked && g.editor.kind === 'client') {
    return err(423, 'Bewerken is tijdelijk uitgeschakeld door de beheerder.');
  }
  const body = await req.json().catch(() => ({}));
  if (typeof body.rev === 'number' && body.rev !== row.rev) {
    return err(409, 'Sla eerst je laatste wijzigingen op.');
  }
  const note = typeof body.note === 'string' ? body.note.slice(0, 200) : null;
  await publishDraft(actorOf(g.editor), note);
  await audit(actorOf(g.editor), 'gepubliceerd', note ? { note } : undefined);
  return NextResponse.json({ ok: true });
}
