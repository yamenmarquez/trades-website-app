import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const lcPath = url.pathname.replace(/\/+/, '/').toLowerCase();
  if (url.pathname !== lcPath) {
    url.pathname = lcPath;
    return NextResponse.redirect(url, 301);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|robots.txt|sitemap.*).*)'],
};
