import { NextResponse, type NextRequest } from 'next/server';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth';
import { AITD_DOMAINS } from '@/lib/aitd/domains';

// Hoofddomeinen van WebDiscovery zelf: hierop draait de normale site + admin.
// Alle andere hosts zijn klantdomeinen → die serveren we via /live.
function isMainHost(host: string): boolean {
  const h = host.split(':')[0].toLowerCase();
  return (
    h === 'webdiscovery.nl' ||
    h === 'www.webdiscovery.nl' ||
    h === 'localhost' ||
    h === '127.0.0.1' ||
    h.endsWith('.vercel.app')
  );
}

// Domein → route van een handgebouwde klantsite in src/app.
const STATIC_SITES: Record<string, string> = Object.fromEntries(AITD_DOMAINS.map((d) => [d, '/aitd']));

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || '';

  // 0) Handgebouwde klantsites met een eigen domein → vaste route (API en assets ongemoeid).
  const h = host.split(':')[0].toLowerCase().replace(/^www\./, '');
  const staticSite = STATIC_SITES[h];
  if (staticSite) {
    const passThrough =
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname === staticSite ||
      pathname.startsWith(`${staticSite}/`);
    if (passThrough) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = `${staticSite}${pathname === '/' ? '' : pathname}`;
    return NextResponse.rewrite(url);
  }

  // 1) Klantdomein? Serveer de gekoppelde live-site (host-routing).
  if (
    !isMainHost(host) &&
    !pathname.startsWith('/live') &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/_next') &&
    !pathname.startsWith('/admin')
  ) {
    const url = request.nextUrl.clone();
    url.pathname = `/live${pathname === '/' ? '' : pathname}`;
    return NextResponse.rewrite(url);
  }

  // 2) Admin-beveiliging (eigen JWT-sessie).
  if (pathname.startsWith('/admin')) {
    const isLogin = pathname === '/admin/login';
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
  }

  return NextResponse.next();
}

export const config = {
  // Draait op alle paden behalve statische assets (nodig voor host-routing).
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
