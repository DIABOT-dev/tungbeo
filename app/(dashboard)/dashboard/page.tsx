'use client';

import { useState, useEffect } from 'react';
import { Droplets, Scale, Activity, Moon, Utensils, Award, Target, Heart } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { StatCard } from '@/components/dashboard/StatCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Metric = Database['public']['Tables']['metrics']['Row'];

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Database['public']['Tables']['profiles']['Row'] | null>(null);
  const [todayMetrics, setTodayMetrics] = useState<Metric[]>([]);
  const [weekGlucose, setWeekGlucose] = useState<{ d: string; v: number }[]>([]);
  const [weekWeight, setWeekWeight] = useState<{ d: string; v: number }[]>([]);
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  // helpers
  const formatDay = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' });

  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        setUser(session.user);

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
          await loadToday(session.user.id);
          await loadWeek(session.user.id);
        }

        const { data: coinsData } = await supabase
          .from('coins_balance')
          .select('balance')
          .eq('user_id', session.user.id)
          .single();
        if (coinsData) setCoins(coinsData.balance);

        const { data: streakData } = await supabase
          .from('streaks')
          .select('current_streak')
          .eq('user_id', session.user.id)
          .single();
        if (streakData) setStreak(streakData.current_streak);

      } catch (e) {
        console.error(e);
        toast.error('Có lỗi khi tải dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadToday = async (userId: string) => {
    // Hút hết theo ngày hiện tại (UTC)
    const start = new Date(); start.setHours(0,0,0,0);
    const end = new Date();   end.setHours(23,59,59,999);
    const { data } = await supabase
      .from('metrics')
      .select('*')
      .eq('user_id', userId)
      .gte('recorded_at', start.toISOString())
      .lt('recorded_at', end.toISOString())
      .order('recorded_at', { ascending: true });
    setTodayMetrics(data || []);
  };

  const loadWeek = async (userId: string) => {
    const end = new Date();
    const start = new Date(); start.setDate(end.getDate() - 6);
    const { data } = await supabase
      .from('metrics')
      .select('type,value,recorded_at')
      .eq('user_id', userId)
      .gte('recorded_at', start.toISOString())
      .lte('recorded_at', end.toISOString())
      .order('recorded_at', { ascending: true });

    const glucose: { d: string; v: number }[] = [];
    const weight: { d: string; v: number }[] = [];

    (data || []).forEach(m => {
      const point = { d: formatDay(m.recorded_at), v: Number(m.value) };
      if (m.type === 'glucose') glucose.push(point);
      if (m.type === 'weight')  weight.push(point);
    });

    // nếu trống, giữ 7 tick cho đẹp
    if (!glucose.length) for (let i = 6; i >= 0; i--) glucose.push({ d: formatDay(new Date(Date.now()-i*86400000).toISOString()), v: 0 });
    if (!weight.length)  for (let i = 6; i >= 0; i--) weight.push({ d: formatDay(new Date(Date.now()-i*86400000).toISOString()), v: 0 });

    setWeekGlucose(glucose);
    setWeekWeight(weight);
  };

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Đang tải…</div>;
  }

  const latest = (t: Metric['type']) => {
    const arr = todayMetrics.filter(m => m.type === t);
    return arr.length ? arr[arr.length - 1] : null;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Chào {profile?.display_name || profile?.full_name || 'bạn'}!
          </h1>
          <p className="text-gray-500 mt-1">
            Hôm nay là {new Date().toLocaleDateString(undefined, { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
            <Award className="h-4 w-4 mr-1 text-amber-500"/> {coins} coins
          </Badge>
          <Badge variant="outline" className="border-brand-300 text-brand-700">
            <Target className="h-4 w-4 mr-1 text-brand-500"/> {streak} ngày
          </Badge>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Đường huyết" value={latest('glucose')?.value ?? '--'} unit="mg/dL" hint={`${todayMetrics.filter(m=>m.type==='glucose').length} lần đo hôm nay`} icon={<Droplets className="h-4 w-4 text-red-500" />} />
        <StatCard title="Cân nặng" value={latest('weight')?.value ?? '--'} unit="kg" hint={`${todayMetrics.filter(m=>m.type==='weight').length} lần cân hôm nay`} icon={<Scale className="h-4 w-4 text-blue-500" />} />
        <StatCard title="Hoạt động" value={latest('activity')?.value ?? '--'} unit="bước" hint={`${todayMetrics.filter(m=>m.type==='activity').length} lần ghi nhận`} icon={<Activity className="h-4 w-4 text-green-500" />} />
        <StatCard title="Giấc ngủ" value={latest('sleep')?.value ?? '--'} unit="giờ" hint={`${todayMetrics.filter(m=>m.type==='sleep').length} lần ghi nhận`} icon={<Moon className="h-4 w-4 text-purple-500" />} />
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-brand-500"/> Ghi nhận nhanh
          </CardTitle>
          <CardDescription>Thêm dữ liệu sức khỏe hôm nay</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <QuickAction href="/log?tab=glucose" icon={<Droplets className="h-6 w-6 text-red-500" />} label="Đường huyết"/>
          <QuickAction href="/log?tab=weight"  icon={<Scale className="h-6 w-6 text-blue-500" />} label="Cân nặng"/>
          <QuickAction href="/log?tab=steps"   icon={<Activity className="h-6 w-6 text-green-500" />} label="Bước chân"/>
          <QuickAction href="/log?tab=sleep"   icon={<Moon className="h-6 w-6 text-purple-500" />} label="Giấc ngủ"/>
          <QuickAction href="/log?tab=meal"    icon={<Utensils className="h-6 w-6 text-amber-500" />} label="Bữa ăn"/>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Xu hướng đường huyết (7 ngày)" data={weekGlucose} unit="mg/dL" color="#ef4444"/>
        <ChartCard title="Xu hướng cân nặng (7 ngày)" data={weekWeight} unit="kg" color="#3b82f6"/>
      </div>

      {/* Today list (giữ tối giản) */}
      <Card>
        <CardHeader><CardTitle>Tổng quan hôm nay</CardTitle></CardHeader>
        <CardContent>
          {todayMetrics.length ? (
            <div className="divide-y rounded-md border">
              {todayMetrics.slice(0, 8).map(m => (
                <div key={m.id} className="flex items-center justify-between p-3">
                  <div className="text-sm">
                    <div className="font-medium capitalize">{m.type}</div>
                    <div className="text-gray-500">
                      {new Date(m.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="text-sm">{m.value} {m.unit}</div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyToday />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function QuickAction({ href, icon, label }: { href: string; icon: React.ReactNode; label: string; }) {
  return (
    <Link href={href}>
      <Button variant="outline" className="w-full h-20 flex flex-col hover:border-brand-300">
        {icon}
        <span className="text-sm mt-2">{label}</span>
      </Button>
    </Link>
  );
}

function EmptyToday() {
  return (
    <div className="text-center py-10 text-gray-500">
      <Heart className="mx-auto h-10 w-10 text-gray-300 mb-4" />
      Chưa có dữ liệu hôm nay
      <div className="mt-4">
        <Link href="/log"><Button className="bg-accent-500 hover:bg-accent-600">+ Ghi nhận đầu tiên</Button></Link>
      </div>
    </div>
  );
}