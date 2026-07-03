import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth-server';
import { searchBusinesses, type RawBusiness } from '@/lib/discovery/places';
import { ingestBusinesses } from '@/lib/discovery/ingest';

export const maxDuration = 60; // scrapen kan even duren

const placesSchema = z.object({
  mode: z.literal('places'),
  query: z.string().min(2).max(200),
  maxResults: z.number().int().min(1).max(60).default(20),
  enrich: z.boolean().default(true),
});

const manualSchema = z.object({
  mode: z.literal('manual'),
  rows: z
    .array(
      z.object({
        name: z.string().min(1),
        website: z.string().optional().nullable(),
        email: z.string().optional().nullable(),
        phone: z.string().optional().nullable(),
        city: z.string().optional().nullable(),
      })
    )
    .min(1)
    .max(500),
  enrich: z.boolean().default(true),
});

const schema = z.discriminatedUnion('mode', [placesSchema, manualSchema]);

export async function POST(req: NextRequest) {
  // Alleen ingelogde admins.
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ongeldige invoer' }, { status: 400 });
  }

  try {
    if (parsed.data.mode === 'places') {
      const businesses = await searchBusinesses(parsed.data.query, parsed.data.maxResults);
      const summary = await ingestBusinesses(businesses, {
        enrich: parsed.data.enrich,
        source: 'google_places',
      });
      return NextResponse.json({ ok: true, summary });
    }

    // mode === 'manual'
    const businesses: RawBusiness[] = parsed.data.rows.map((r) => ({
      name: r.name,
      website: r.website || null,
      email: r.email || null,
      phone: r.phone || null,
      address: null,
      city: r.city || null,
      placeId: null,
    }));
    const summary = await ingestBusinesses(businesses, {
      enrich: parsed.data.enrich,
      source: 'manual',
    });
    return NextResponse.json({ ok: true, summary });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Onbekende fout';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
