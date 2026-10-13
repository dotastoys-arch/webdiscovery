import { NextResponse, type NextRequest } from 'next/server';
import { hasDb } from '@/lib/db';
import { getEditor, sameOrigin, type Editor } from './auth';
import { ensureSchema } from './db';

// Gemeenschappelijke toegangscontrole voor de /api/aitd/*-routes.
// mutating = wijzigt iets → ook Origin-check (CSRF). adminOnly = alleen Claudia.

export function err(status: number, error: string) {
  return NextResponse.json({ error }, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function guard(
  req: NextRequest,
  opts: { mutating?: boolean; adminOnly?: boolean } = {}
): Promise<{ editor: Editor } | { response: NextResponse }> {
  if (!hasDb()) return { response: err(503, 'De database is niet gekoppeld.') };
  if (opts.mutating && !sameOrigin(req)) return { response: err(403, 'Verzoek geweigerd.') };
  const editor = await getEditor();
  if (!editor) return { response: err(401, 'Je bent niet (meer) ingelogd.') };
  if (opts.adminOnly && editor.kind !== 'admin') return { response: err(403, 'Alleen de beheerder mag dit.') };
  await ensureSchema();
  return { editor };
}

export function actorOf(e: Editor): string {
  return e.kind === 'admin' ? 'beheerder' : `klant:${e.email}`;
}
