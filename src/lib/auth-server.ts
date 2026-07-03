import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySessionToken } from './auth';

// Server-only: leest de sessiecookie via next/headers. NIET in middleware
// gebruiken (die leest request.cookies zelf).
export async function getSession(): Promise<{ email: string } | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
