import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
  // >>> BYPASS AUTH TRONG DEV
  if (process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === '1') {
    return NextResponse.next();
  }
  // <<<

  const res = NextResponse.next();
  const url = request.nextUrl.clone();

  // >>> BYPASS AUTH TRONG DEV
  if (process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === '1') return res;
  // <<<

  // Skip middleware for static files, API routes, and auth routes
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/auth') || // includes /auth/callback
    url.pathname === '/' ||
    url.pathname === '/onboarding' ||
    url.pathname.startsWith('/public') ||
    url.pathname === '/terms' ||
    url.pathname === '/privacy'
  ) {
    return res;
  }

  try {
    const supabase = createMiddlewareClient({ req: request, res });
    
    // Sync session cookie - critical for auth state
    await supabase.auth.getSession();

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Check onboarding status for authenticated users
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_status')
      .eq('id', session.user.id)
      .single();

    if (profile?.onboarding_status !== 'completed') {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public|api|auth|$).*)'],
};