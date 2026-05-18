import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const userRole = request.cookies.get('user_role')?.value;
  const { pathname } = request.nextUrl;

  // 1. If user is NOT logged in and tries to access dashboards
  if (!token && (
    pathname.startsWith('/admin') || 
    pathname.startsWith('/agent') || 
    pathname.startsWith('/owner') || 
    pathname.startsWith('/tenant')
  )) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. If user is logged in but tries to access wrong dashboard
  if (token && userRole) {
    if (pathname.startsWith('/admin') && userRole !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL(getDefaultPath(userRole), request.url));
    }
    if (pathname.startsWith('/agent') && userRole !== 'AGENT') {
      return NextResponse.redirect(new URL(getDefaultPath(userRole), request.url));
    }
    if (pathname.startsWith('/owner') && userRole !== 'OWNER') {
      return NextResponse.redirect(new URL(getDefaultPath(userRole), request.url));
    }
    if (pathname.startsWith('/tenant') && userRole !== 'TENANT') {
      return NextResponse.redirect(new URL(getDefaultPath(userRole), request.url));
    }
  }

  // 3. If user is logged in and tries to access login/register
  if (token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL(getDefaultPath(userRole || 'TENANT'), request.url));
  }

  return NextResponse.next();
}

function getDefaultPath(role: string): string {
  switch (role) {
    case 'SUPER_ADMIN': return '/admin';
    case 'AGENT': return '/agent';
    case 'OWNER': return '/owner';
    case 'TENANT': return '/tenant';
    default: return '/';
  }
}

// Ensure the middleware function is also the default export for compatibility
export default middleware;

export const config = {
  matcher: [
    '/admin/:path*',
    '/agent/:path*',
    '/owner/:path*',
    '/tenant/:path*',
    '/login',
    '/register',
  ],
};
