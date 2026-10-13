import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import { getSession } from '@/lib/auth-server';
import { getSql } from '@/lib/db';
import { ensureSchema } from './db';

// Authenticatie voor het AITD-klantportaal.
// - Klant: e-mail + wachtwoord (scrypt), eigen sessiecookie (8 uur), direct
//   intrekbaar via session_version/active.
// - Beheerder: de bestaande WebDiscovery-adminsessie (alleen Claudia) heeft
//   altijd toegang en extra rechten (accounts, versies, vergrendelen).

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

export const CLIENT_COOKIE = 'aitd_session';
const SESSION_HOURS = 8;
const MAX_FAILS_PER_ACCOUNT = 5;
const LOCK_MINUTES = 15;
const MAX_FAILS_PER_IP = 20;

export const MIN_PASSWORD_LENGTH = 10;

export async function hashPassword(pw: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(pw, salt, 64);
  return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`;
}

async function checkPassword(pw: string, stored: string): Promise<boolean> {
  const [alg, saltB64, hashB64] = stored.split('$');
  if (alg !== 'scrypt' || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, 'base64');
  const actual = await scrypt(pw, Buffer.from(saltB64, 'base64'), expected.length);
  return timingSafeEqual(actual, expected);
}

// Dummy-hash zodat een onbekend e-mailadres even lang duurt als een fout wachtwoord.
const DUMMY_HASH = `scrypt$${Buffer.alloc(16).toString('base64')}$${Buffer.alloc(64).toString('base64')}`;

export function passwordProblem(pw: string): string | null {
  if (pw.length < MIN_PASSWORD_LENGTH) return `Kies een wachtwoord van minimaal ${MIN_PASSWORD_LENGTH} tekens.`;
  if (pw.length > 200) return 'Dat wachtwoord is te lang.';
  if (!/[a-zA-Z]/.test(pw) || !/[0-9]/.test(pw)) return 'Gebruik zowel letters als cijfers.';
  return null;
}

export function generatePassword(): string {
  // Leesbaar tijdelijk wachtwoord, bv. "kraan-Mist-4827-tafel".
  const words = ['anker', 'beek', 'duin', 'egel', 'fjord', 'golf', 'haven', 'iris', 'kade', 'linde', 'mist', 'noord', 'oever', 'polder', 'regen', 'storm', 'tulp', 'vlinder', 'wolk', 'zeil'];
  const b = randomBytes(6);
  const w = (i: number) => words[b[i] % words.length];
  const num = 1000 + (b.readUInt16BE(4) % 9000);
  return `${w(0)}-${w(1)[0].toUpperCase()}${w(1).slice(1)}-${num}-${w(2)}`;
}

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error('AUTH_SECRET ontbreekt');
  return new TextEncoder().encode(s);
}

export function clientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
}

export type LoginResult =
  | { ok: true; token: string }
  | { ok: false; status: number; error: string };

export async function loginClient(email: string, password: string, ip: string): Promise<LoginResult> {
  await ensureSchema();
  const sql = getSql();
  const e = email.trim().toLowerCase();
  const generic = { ok: false as const, status: 401, error: 'Onjuist e-mailadres of wachtwoord.' };

  const ipFails = await sql`
    select count(*)::int as n from aitd_login_attempts
    where ip = ${ip} and success = false and at > now() - interval '15 minutes'`;
  if ((ipFails[0]?.n as number) >= MAX_FAILS_PER_IP) {
    return { ok: false, status: 429, error: 'Te veel mislukte pogingen. Probeer het over 15 minuten opnieuw.' };
  }

  const rows = await sql`select * from aitd_users where email = ${e} limit 1`;
  const u = rows[0];
  const valid = await checkPassword(password, (u?.password_hash as string) ?? DUMMY_HASH);

  const record = (success: boolean) =>
    sql`insert into aitd_login_attempts (ip, email, success) values (${ip}, ${e}, ${success})`;

  if (!u || !u.active) {
    await record(false);
    return generic;
  }
  if (u.locked_until && new Date(u.locked_until as string) > new Date()) {
    await record(false);
    return { ok: false, status: 423, error: `Dit account is tijdelijk geblokkeerd na te veel pogingen. Probeer het over ${LOCK_MINUTES} minuten opnieuw.` };
  }
  if (!valid) {
    await record(false);
    const fails = (u.failed_attempts as number) + 1;
    if (fails >= MAX_FAILS_PER_ACCOUNT) {
      await sql`update aitd_users set failed_attempts = 0, locked_until = now() + make_interval(mins => ${LOCK_MINUTES}) where id = ${u.id}`;
    } else {
      await sql`update aitd_users set failed_attempts = ${fails} where id = ${u.id}`;
    }
    return generic;
  }

  await record(true);
  await sql`update aitd_users set failed_attempts = 0, locked_until = null, last_login_at = now() where id = ${u.id}`;
  // Oude pogingen opruimen (houdt de tabel klein).
  await sql`delete from aitd_login_attempts where at < now() - interval '30 days'`;

  const token = await new SignJWT({ v: u.session_version as number })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(u.id))
    .setAudience('aitd-client')
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(secret());
  return { ok: true, token };
}

export const clientCookieOptions = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_HOURS * 60 * 60,
};

export type Editor =
  | { kind: 'admin'; label: string }
  | { kind: 'client'; label: string; userId: number; email: string };

// Wie is er ingelogd in het portaal? Beheerder gaat voor.
export async function getEditor(): Promise<Editor | null> {
  const admin = await getSession();
  if (admin) return { kind: 'admin', label: `beheerder (${admin.email})` };

  const token = (await cookies()).get(CLIENT_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { audience: 'aitd-client' });
    await ensureSchema();
    const sql = getSql();
    const rows = await sql`select id, email, name, active, session_version from aitd_users where id = ${Number(payload.sub)} limit 1`;
    const u = rows[0];
    if (!u || !u.active || u.session_version !== payload.v) return null;
    return { kind: 'client', label: (u.name as string) || (u.email as string), userId: u.id as number, email: u.email as string };
  } catch {
    return null;
  }
}

export async function getAdmin(): Promise<{ email: string } | null> {
  return getSession();
}

// CSRF-bescherming voor wijzigende API-calls: alleen verzoeken vanaf onze eigen site.
export function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return false;
  try {
    return new URL(origin).host === req.headers.get('host');
  } catch {
    return false;
  }
}
