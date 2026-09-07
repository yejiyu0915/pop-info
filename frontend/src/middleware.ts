import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/posts/write', '/mypage'];
function isProtectedPath(pathname: string) {
  if (PROTECTED_PATHS.some((p) => pathname.startsWith(p))) return true;
  return /^\/posts\/\d+\/edit$/.test(pathname);
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token');
  const { pathname } = request.nextUrl;

  if (isProtectedPath(pathname) && !token?.value) {
    const loginUrl = new URL('/login', request.url);
    const returnPath = pathname + request.nextUrl.search;
    loginUrl.searchParams.set('redirect', returnPath);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/posts/write', '/posts/:id/edit', '/mypage', '/login', '/register', '/forgot-password'],
};
