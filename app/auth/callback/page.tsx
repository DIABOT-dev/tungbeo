'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Heart } from 'lucide-react';

export default function OAuthCallback() {
  const router = useRouter();
  const qs = useSearchParams();
  const [msg, setMsg] = useState('Đang xử lý đăng nhập...');

  useEffect(() => {
    const run = async () => {
      try {
        const err = qs.get('error_description') || qs.get('error');
        if (err) {
          console.error('[OAuth callback] Provider error:', err);
          router.replace(`/auth/login?e=${encodeURIComponent(err)}`);
          return;
        }

        const code = qs.get('code');
        if (!code) {
          console.error('[OAuth callback] Missing code');
          setMsg('Thiếu OAuth code'); 
          router.replace('/auth/login?e=missing%20code');
          return;
        }

        console.log('[OAuth callback] Exchanging code for session...');
        setMsg('Đang thiết lập phiên đăng nhập...');

        // Đổi code -> session NGAY TRÊN CLIENT (tránh server 500)
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error('[OAuth callback] Exchange error:', error.message);
          router.replace(`/auth/login?e=${encodeURIComponent(error.message)}`);
          return;
        }

        console.log('[OAuth callback] Session established, checking user...');
        setMsg('Đang kiểm tra thông tin người dùng...');

        // Kiểm tra onboarding để điều hướng
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { 
          console.error('[OAuth callback] No user after session');
          router.replace('/auth/login?e=no%20user'); 
          return; 
        }

        console.log('[OAuth callback] User found:', user.id);
        setMsg('Đang kiểm tra trạng thái onboarding...');

        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_status')
          .eq('id', user.id)
          .single();

        const destination = profile?.onboarding_status === 'completed' ? '/dashboard' : '/onboarding';
        console.log('[OAuth callback] Redirecting to:', destination);
        
        setMsg('Đăng nhập thành công! Đang chuyển hướng...');
        router.replace(destination);

      } catch (error) {
        console.error('[OAuth callback] Unexpected error:', error);
        setMsg('Có lỗi xảy ra khi xử lý đăng nhập');
        router.replace('/auth/login?e=unexpected%20error');
      }
    };

    run();
  }, [router, qs]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-sky-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Heart className="h-8 w-8 text-green-600 animate-pulse" />
          <span className="text-2xl font-bold text-gray-900">DIABOT</span>
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="text-gray-600">{msg}</p>
      </div>
    </div>
  );
}