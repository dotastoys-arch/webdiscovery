import { SignJWT, jwtVerify } from 'jose';

// Eigen admin-auth (vervangt Supabase Auth). Eén admin via env:
//   ADMIN_EMAIL, ADMIN_PASSWORD, AUTH_SECRET
// Sessie = ondertekende JWT in een httpOnly cookie. Edge-compatibel (jose).
// Alleen edge-veilige functies hier (GEEN next/headers) — zie auth-server.ts
// voor getSession().

export const SESSION_COOKIE = 'wd_session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 dagen

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error('AUTH_SECRET ontbreekt');
  return new TextEncoder().encode(s);
}

export function hasAuthConfig(): boolean {
  return !!(process.env.AUTH_SECRET && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD);
}

export function verifyCredentials(email: string, password: string): boolean {
  const okEmail = email.trim().toLowerCase() === (process.env.ADMIN_EMAIL ?? '').toLowerCase();
  const okPass = password === process.env.ADMIN_PASSWORD;
  return okEmail && okPass;
}

export async function createSessionToken(email: string): Promise<string> {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
}

export async function verifySessionToken(token: string): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return { email: String(payload.email) };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: true,
  path: '/',
  maxAge: MAX_AGE,
};
