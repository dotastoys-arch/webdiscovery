import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { getSql, hasDb } from '@/lib/db';
import type { Lead } from '@/types/db';

// Exporteert alle leads als CSV (alleen voor ingelogde admins).
function csvCell(v: unknown): string {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!hasDb()) return NextResponse.json({ error: 'geen database' }, { status: 503 });

  const sql = getSql();
  const leads = (await sql`select * from leads order by score desc nulls last, created_at desc`) as unknown as Lead[];

  const cols = ['company_name', 'email', 'phone', 'city', 'website_url', 'has_website', 'rating', 'score', 'status', 'source', 'created_at'] as const;
  const header = cols.join(',');
  const rows = leads.map((l) => cols.map((c) => csvCell(l[c as keyof Lead])).join(','));
  const csv = '﻿' + [header, ...rows].join('\n'); // BOM voor Excel

  return new NextResponse(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="leads-webdiscovery.csv"`,
    },
  });
}
