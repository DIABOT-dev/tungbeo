'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { toast } from 'sonner';
import { Heart, AlertCircle } from 'lucide-react';
import { getSupabaseBrowser, saveDevSupabaseConfig } from '@/lib/supabase-browser';

export default function AuthPage() {
  const supabase = getSupabaseBrowser();
  const router = useRouter();
  const qs = useSearchParams();
  const initialMode = (qs.get('mode') === 'register') ? 'register' : 'login';
  const errorParam = qs.get('e'); // Error from OAuth callback

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Dev-only: nếu chưa có ENV, hiển thị form nhập Supabase URL & ANON để test StackBlitz
  const [devUrl, setDevUrl] = useState('');
  const [devAnon, setDevAnon] = useState('');

  useEffect(() => {
    const boot = async () => {
      if (!supabase) return; // chưa có config
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Dọn sạch ?e=... để không hiện lỗi nháy
        if (typeof window !== 'undefined' && window.location?.search?.includes('e=')) {
          window.history.replaceState({}, '', '/auth/login');
        }
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_status')
          .eq('id', session.user.id)
          .single();
        router.replace(profile?.onboarding_status === 'completed' ? '/dashboard' : '/onboarding');
      }
    };
    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  const handleGoogle = async () => {
    try {
      // Dynamic origin detection (Bolt-safe) - no ENV dependency
      const origin = typeof window !== 'undefined' ? window.location?.origin || '' : '';
      const redirectTo = `${origin}/auth/callback`;
      
      console.log('[Google OAuth] Redirect to:', redirectTo);
      console.log('[Google OAuth] Current origin:', origin);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo }
      });

      if (error) {
        console.error('[Google OAuth] Error:', error);
        // Show error in URL for immediate visibility
        window.location.href = `/auth/login?e=${encodeURIComponent(error.message)}`;
        return;
      }
      
      console.log('[Google OAuth] Success, redirecting...');
    } catch (err: any) {
      console.error('[Google OAuth] Exception:', err);
      window.location.href = `/auth/login?e=${encodeURIComponent(err?.message || 'Google OAuth failed')}`;
    }
  };

  const handleFacebook = async () => {
    try {
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '/auth/callback';

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: { redirectTo }
      });

      if (error) {
        console.error('[Facebook OAuth] Error:', error);
        toast.error(`Facebook OAuth Error: ${error.message}`);
        return;
      }
    } catch (err: any) {
      console.error('[Facebook OAuth] Exception:', err);
      toast.error(err?.message || 'Không thể đăng nhập Facebook');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) { toast.error('Thiếu cấu hình Supabase. Nhập ở khung bên dưới.'); return; }
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error('Đăng nhập thất bại'); return;
        }
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_status')
          .eq('id', user.id)
          .single();

        router.replace(profile?.onboarding_status === 'completed' ? '/dashboard' : '/onboarding');
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) router.replace('/onboarding');
        else toast.success('Đăng ký thành công! Kiểm tra email để xác nhận.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  // Nếu thiếu ENV => show khung cấu hình DEV
  if (!supabase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Cấu hình Supabase (Dev)</CardTitle>
            <CardDescription>
              Chưa thấy <code>NEXT_PUBLIC_SUPABASE_URL</code> / <code>ANON_KEY</code>.  
              Bạn có thể dán tạm ở đây (lưu vào localStorage) để chạy thử trên StackBlitz.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>SUPABASE URL</Label>
              <Input value={devUrl} onChange={e=>setDevUrl(e.target.value)} placeholder="https://xxxx.supabase.co" />
            </div>
            <div className="space-y-2">
              <Label>SUPABASE ANON KEY</Label>
              <Input value={devAnon} onChange={e=>setDevAnon(e.target.value)} placeholder="eyJhbGciOi..." />
            </div>
            <Button className="w-full" onClick={()=>saveDevSupabaseConfig(devUrl, devAnon)}>
              Lưu & Reload
            </Button>
            <p className="text-xs text-center text-gray-500">
              Khi triển khai thật, hãy dùng <code>.env.local</code> thay vì cách này.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">DIABOT</span>
          </div>
          <CardTitle className="text-2xl">
            {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
          </CardTitle>
          <CardDescription>
            {mode === 'login'
              ? 'Chào mừng trở lại!'
              : 'Bắt đầu hành trình quản lý sức khỏe của bạn'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Show OAuth error if any */}
          {errorParam && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Lỗi OAuth: {decodeURIComponent(errorParam)}
              </AlertDescription>
            </Alert>
          )}

          {/* OAuth buttons */}
          <div className="grid grid-cols-1 gap-2 mb-4">
            <Button variant="outline" onClick={handleGoogle}>
              Đăng nhập bằng Google
            </Button>
            <Button variant="outline" onClick={handleFacebook}>
              Đăng nhập bằng Facebook
            </Button>
          </div>

          <div className="text-center text-xs text-gray-500 mb-4">hoặc dùng email</div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* DEV QUICK LOGIN */}
            {process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === '1' && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800 mb-2">🚀 DEV MODE - Quick Login:</p>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setEmail('dev@diabot.local');
                      setPassword('dev123456');
                    }}
                  >
                    Fill Dev Credentials
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.location.href = '/dashboard';
                      }
                    }}
                  >
                    Skip to Dashboard
                  </Button>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Đang xử lý...' : (mode === 'login' ? 'Đăng nhập' : 'Đăng ký')}
            </Button>
          </form>

          <div className="text-sm text-center mt-4">
            {mode === 'login' ? (
              <>
                Chưa có tài khoản?{' '}
                <button className="text-blue-600 underline" onClick={() => setMode('register')}>
                  Đăng ký
                </button>
              </>
            ) : (
              <>
                Đã có tài khoản?{' '}
                <button className="text-blue-600 underline" onClick={() => setMode('login')}>
                  Đăng nhập
                </button>
              </>
            )}
          </div>

          <div className="text-xs text-center text-gray-500 mt-6">
            Bằng cách tiếp tục, bạn đồng ý với{' '}
            <Link href="/terms" className="underline">Điều khoản</Link> &{' '}
            <Link href="/privacy" className="underline">Chính sách</Link>.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}