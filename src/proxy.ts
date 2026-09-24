import { NextResponse, type NextRequest } from 'next/server';
import { decideAccess } from '@/lib/session/access';
import { SESSION_COOKIE, sessionFromCookie } from '@/lib/session/personas';

export function proxy(request: NextRequest) {
  const session = sessionFromCookie(request.cookies.get(SESSION_COOKIE)?.value);
  const decision = decideAccess(request.nextUrl.pathname, session);
  if (decision.type === 'redirect') {
    return NextResponse.redirect(new URL(decision.to, request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Fără fișierele statice, imagini, fonturi și rutele interne Next.
  matcher: ['/((?!_next/|fonts/|brand/|favicon.ico|.*\\.(?:png|jpg|svg|ico|woff2)$).*)'],
};
