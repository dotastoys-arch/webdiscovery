import { NextResponse } from 'next/server';
import { CLIENT_COOKIE, clientCookieOptions } from '@/lib/aitd/auth';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(CLIENT_COOKIE, '', { ...clientCookieOptions, maxAge: 0 });
  return res;
}
