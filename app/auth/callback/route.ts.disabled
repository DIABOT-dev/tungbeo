import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error_description') || url.searchParams.get('error');

  // Nếu nhà cung cấp trả lỗi, quay về login kèm thông báo
  if (error) {
    console.error('[OAuth callback] provider error:', error);
    return NextResponse.redirect(new URL(`/auth/login?e=${encodeURIComponent(error)}`, request.url));
  }

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('[OAuth callback] exchange error:', exchangeError.message);
      return NextResponse.redirect(new URL(`/auth/login?e=${encodeURIComponent(exchangeError.message)}`, request.url));
    }
  }

  // Sau khi đổi session xong, chuyển tới dashboard
  const next = url.searchParams.get('next') ?? '/dashboard';
  return NextResponse.redirect(new URL(next, request.url));
}