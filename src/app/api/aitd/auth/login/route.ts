import { NextRequest, NextResponse } from 'next/server';
import { hasDb } from '@/lib/db';
import { CLIENT_COOKIE, clientCookieOptions, clientIp, loginClient, sameOrigin } from '@/lib/aitd/auth';
import { audit } from '@/lib/aitd/db';
import { err } from '@/lib/aitd/api';

// Inloggen voor de klant (AITD). Rate-limits + accountblokkade zitten in loginClient.
export async function POST(req: NextRequest) {
  if (!hasDb()) return err(503, 'De database is niet gekoppeld.');
  if (!sameOrigin(req)) return err(403, 'Verzoek geweigerd.');
  const { email, password } = await req.json().catch(() => ({}));
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password || email.length > 200 || password.length > 200) {
    return err(400, 'Vul je e-mailadres en wachtwoord in.');
  }
  const result = await loginClient(email, password, clientIp(req));
  if (!result.ok) return err(result.status, result.error);
  await audit(`klant:${email.trim().toLowerCase()}`, 'login');
  const res = NextResponse.json({ ok: true });
  res.cookies.set(CLIENT_COOKIE, result.token, clientCookieOptions);
  return res;
}
