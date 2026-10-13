import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import { guard } from '@/lib/aitd/api';

// Activiteitenlog — alleen de beheerder.
export async function GET(req: NextRequest) {
  const g = await guard(req, { adminOnly: true });
  if ('response' in g) return g.response;
  const rows = await getSql()`select id, actor, action, detail, at from aitd_audit order by id desc limit 200`;
  return NextResponse.json({ items: rows }, { headers: { 'Cache-Control': 'no-store' } });
}
