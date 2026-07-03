import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

// Neon (gratis Postgres) databasehelper. Vervangt Supabase.
// Gebruik: const sql = getSql(); const rows = await sql`select * from leads`;

let _sql: NeonQueryFunction<false, false> | null = null;

export function hasDb(): boolean {
  return !!process.env.DATABASE_URL;
}

export function getSql(): NeonQueryFunction<false, false> {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL ontbreekt');
  if (!_sql) _sql = neon(process.env.DATABASE_URL);
  return _sql;
}
