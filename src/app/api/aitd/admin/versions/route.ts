import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import { guard } from '@/lib/aitd/api';

// Gepubliceerde versies (nieuwste eerst) — alleen de beheerder.
export async function GET(req: NextRequest) {
  const g = await guard(req, { adminOnly: true });
  if ('response' in g) return g.response;
  const rows = await getSql()`select id, note, created_by, created_at from aitd_versions order by id desc limit 100`;
  return NextResponse.json({ versions: rows }, { headers: { 'Cache-Control': 'no-store' } });
}
