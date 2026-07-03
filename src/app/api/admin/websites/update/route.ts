import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { getSql } from '@/lib/db';
import { siteContentSchema } from '@/lib/generate/schema';

// Slaat handmatige bewerkingen aan een gegenereerde site op (eenvoudig CMS).
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { siteId, fields } = (await req.json().catch(() => ({}))) as {
    siteId?: string;
    fields?: Record<string, string>;
  };
  if (!siteId || !fields) return NextResponse.json({ error: 'ongeldige invoer' }, { status: 400 });

  const sql = getSql();
  const rows = await sql`select content from generated_sites where id = ${siteId} limit 1`;
  if (!rows[0]) return NextResponse.json({ error: 'niet gevonden' }, { status: 404 });

  const parsed = siteContentSchema.safeParse(rows[0].content);
  if (!parsed.success) return NextResponse.json({ error: 'content ongeldig' }, { status: 400 });
  const c = parsed.data;

  // Bewerkbare velden toepassen.
  c.brand.tagline = fields.tagline ?? c.brand.tagline;
  c.theme.accent = fields.accent ?? c.theme.accent;
  c.hero.headline = fields.headline ?? c.hero.headline;
  c.hero.subheadline = fields.subheadline ?? c.hero.subheadline;
  c.hero.ctaLabel = fields.ctaLabel ?? c.hero.ctaLabel;
  c.about.title = fields.aboutTitle ?? c.about.title;
  c.about.body = fields.aboutBody ?? c.about.body;

  await sql`update generated_sites set content = ${JSON.stringify(c)}::jsonb, updated_at = now() where id = ${siteId}`;
  return NextResponse.json({ ok: true });
}
