import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/posts/write', '/mypage'];
const AUTH_PATHS = ['/login', '/register', '/forgot-password'];

function isProtectedPath(pathname: string) {
  if (PROTECTED_PATHS.some((p) => pathname.startsWith(p))) return true;
  return /^\/posts\/\d+\/edit$/.test(pathname);
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token');
  const { pathname } = request.nextUrl;
  const isLoggedIn = !!token?.value;

  if (isProtectedPath(pathname) && !isLoggedIn) {
    const loginUrl = new URL('/login', request.url);
    const returnPath = pathname + request.nextUrl.search;
    loginUrl.searchParams.set('redirect', returnPath);
    return NextResponse.redirect(loginUrl);
  }

  if (AUTH_PATHS.includes(pathname) && isLoggedIn) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/posts/write', '/posts/:id/edit', '/mypage', '/login', '/register', '/forgot-password'],
};
