import { NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/dashboard/')) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      const redirectUrl = new URL('/login', req.url);
      redirectUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (pathname.startsWith('/api/proof/') || pathname.startsWith('/api/billing/')) {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (!session || error) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  if (
    pathname.startsWith('/proof/public/') ||
    pathname.startsWith('/api/waitlist')
  ) {
    return res;
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*', '/proof/public/:path*'],
};