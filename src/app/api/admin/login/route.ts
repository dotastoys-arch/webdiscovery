import { NextRequest, NextResponse } from 'next/server';
import { verifyCredentials, createSessionToken, hasAuthConfig, SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  if (!hasAuthConfig()) {
    return NextResponse.json({ error: 'Login is nog niet geconfigureerd (env ontbreekt).' }, { status: 500 });
  }
  const { email, password } = await req.json().catch(() => ({}));
  if (typeof email !== 'string' || typeof password !== 'string') {
    return NextResponse.json({ error: 'Vul e-mail en wachtwoord in.' }, { status: 400 });
  }
  if (!verifyCredentials(email, password)) {
    return NextResponse.json({ error: 'Onjuiste inloggegevens.' }, { status: 401 });
  }

  const token = await createSessionToken(email.toLowerCase());
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return res;
}
