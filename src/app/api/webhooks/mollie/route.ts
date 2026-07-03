import { NextRequest, NextResponse } from 'next/server';

// FASE 4 — Mollie betaal-webhook.
// Mollie POST't hierheen met een payment id. Straks:
//   1. Payment ophalen bij Mollie (status verifiëren — vertrouw de POST niet blind).
//   2. Bij 'paid': order op 'paid' zetten, paid_at vullen, oplevering starten.
//   3. Bevestigingsmail + stappenplan domeinkoppeling sturen.
export async function POST(req: NextRequest) {
  const body = await req.formData().catch(() => null);
  const paymentId = body?.get('id');
  // TODO(fase 4): verifieer bij Mollie en werk de order bij.
  console.log('[mollie webhook] payment', paymentId);
  return NextResponse.json({ ok: true });
}
