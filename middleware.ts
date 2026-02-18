import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  //   const token = localStorage.getItem('accessToken');
  let role = null;

  if (token) {
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      role = payload.role;
    } catch { }
  }

  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith('/cart')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (pathname.startsWith('/admin')) {
    if (!token || role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Middleware riêng cho customer
  if (pathname.startsWith('/customer')) {
    if (!token || role !== 'customer') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    if (token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
}
export const config = {
  matcher: ['/admin/:path*', '/customer/:path*'],
};