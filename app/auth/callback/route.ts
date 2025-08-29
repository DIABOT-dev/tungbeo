import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { makeRouteClient } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error_description') || url.searchParams.get('error');

  // Nếu nhà cung cấp trả lỗi, quay về login kèm thông báo
  if (error) {
    return NextResponse.redirect(`${url.origin}/auth/login?e=${encodeURIComponent(error)}`);
  }

  if (code) {
    const supabase = makeRouteClient(cookies);
    const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
    if (exErr) {
      return NextResponse.redirect(`${url.origin}/auth/login?e=${encodeURIComponent(exErr.message)}`);
    }
  }

  // Đích sau khi set session xong
  return NextResponse.redirect(`${url.origin}/dashboard`);
}