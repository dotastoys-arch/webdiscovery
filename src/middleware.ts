import { NextResponse, type NextRequest } from 'next/server';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth';

// Beschermt /admin met de eigen JWT-sessie (Neon-stack, geen Supabase).
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith('/admin')) return NextResponse.next();

  const isLogin = pathname === '/admin/login';

  // Zonder auth-config kunnen we niet inloggen; laat door (bv. lokaal/preview).
  if (!process.env.AUTH_SECRET) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!isLogin && !session) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
  if (isLogin && session) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    url.search = '';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
