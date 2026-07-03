import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth-server';
import { createGeneratedSite } from '@/lib/generate/store';

export const maxDuration = 60;

const schema = z.object({ leadId: z.string().uuid() });

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Ongeldige invoer' }, { status: 400 });

  try {
    const outcome = await createGeneratedSite(parsed.data.leadId);
    return NextResponse.json({ ok: true, ...outcome });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Onbekende fout';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
