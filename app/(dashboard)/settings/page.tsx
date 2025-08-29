'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe,
  Smartphone,
  Database,
  Brain
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe,
  Smartphone,
  Database,
  Brain
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [consents, setConsents] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        setUser(session.user);

        // Get profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
        }

        // Get consents
        const { data: consentsData } = await supabase
          .from('consents')
          .select('*')
          .eq('user_id', session.user.id);

        const consentsMap: any = {};
        consentsData?.forEach(c => {
          consentsMap[c.kind] = c.granted;
        });
        setConsents(consentsMap);

      } catch (error) {
        console.error('Error loading settings:', error);
        toast.error('Có lỗi khi tải cài đặt');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleConsentChange = async (kind: string, granted: boolean) => {
    try {
      const { error } = await supabase
        .from('consents')
        .upsert({
          user_id: user.id,
          kind,
          granted,
          granted_at: granted ? new Date().toISOString() : null
        }, { onConflict: 'user_id,kind' });

      if (error) throw error;

      setConsents({ ...consents, [kind]: granted });
      toast.success('Đã cập nhật cài đặt');

    } catch (error) {
      console.error('Error updating consent:', error);
      toast.error('Có lỗi khi cập nhật');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [consents, setConsents] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        setUser(session.user);

        // Get profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
        }

        // Get consents
        const { data: consentsData } = await supabase
          .from('consents')
          .select('*')
          .eq('user_id', session.user.id);

        const consentsMap: any = {};
        consentsData?.forEach(c => {
          consentsMap[c.kind] = c.granted;
        });
        setConsents(consentsMap);

      } catch (error) {
        console.error('Error loading settings:', error);
        toast.error('Có lỗi khi tải cài đặt');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleConsentChange = async (kind: string, granted: boolean) => {
    try {
      const { error } = await supabase
        .from('consents')
        .upsert({
          user_id: user.id,
          kind,
          granted,
          granted_at: granted ? new Date().toISOString() : null
        }, { onConflict: 'user_id,kind' });

      if (error) throw error;

      setConsents({ ...consents, [kind]: granted });
      toast.success('Đã cập nhật cài đặt');

    } catch (error) {
      console.error('Error updating consent:', error);
      toast.error('Có lỗi khi cập nhật');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cài đặt</h1>
          <p className="text-gray-600 mt-1">Tùy chỉnh tài khoản và quyền riêng tư</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5 text-brand-500" />
              Thông tin cá nhân
            </CardTitle>
            <CardDescription>
              Quản lý thông tin tài khoản của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Email</Label>
              <p className="text-sm font-medium">{user?.email}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Tên hiển thị</Label>
              <p className="text-sm font-medium">{profile?.display_name || 'Chưa đặt'}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Múi giờ</Label>
              <p className="text-sm font-medium">{profile?.timezone || 'Asia/Bangkok'}</p>
            </div>
            <Button variant="outline" className="w-full" disabled>
              <Badge variant="secondary" className="mr-2">Sắp có</Badge>
              Chỉnh sửa thông tin
            </Button>
          </CardContent>
        </Card>

        {/* Privacy & Consent */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5 text-blue-500" />
              Quyền riêng tư
            </CardTitle>
            <CardDescription>
              Kiểm soát cách sử dụng dữ liệu của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Xử lý AI</Label>
                <p className="text-xs text-gray-500">Cho phép AI phân tích dữ liệu để đưa ra gợi ý</p>
              </div>
              <Switch
                checked={consents.ai_processing || false}
                onCheckedChange={(checked) => handleConsentChange('ai_processing', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Marketing</Label>
                <p className="text-xs text-gray-500">Nhận thông tin về sản phẩm và dịch vụ mới</p>
              </div>
              <Switch
                checked={consents.marketing || false}
                onCheckedChange={(checked) => handleConsentChange('marketing', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5 text-purple-500" />
              Thông báo
            </CardTitle>
            <CardDescription>
              Cài đặt nhắc nhở và thông báo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Push notifications</Label>
                <p className="text-xs text-gray-500">Nhận thông báo trên thiết bị</p>
              </div>
              <Switch disabled />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Email notifications</Label>
                <p className="text-xs text-gray-500">Nhận thông báo qua email</p>
              </div>
              <Switch disabled />
            </div>

            <Button variant="outline" className="w-full" disabled>
              <Badge variant="secondary" className="mr-2">Sắp có</Badge>
              Quản lý nhắc nhở
            </Button>
          </CardContent>
        </Card>

        {/* App Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="mr-2 h-5 w-5 text-orange-500" />
              Giao diện
            </CardTitle>
            <CardDescription>
              Tùy chỉnh giao diện ứng dụng
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Chế độ tối</Label>
                <p className="text-xs text-gray-500">Giao diện tối cho mắt</p>
              </div>
              <Switch disabled />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Ngôn ngữ</Label>
                <p className="text-xs text-gray-500">Tiếng Việt</p>
              </div>
              <Badge variant="outline">VN</Badge>
            </div>

            <Button variant="outline" className="w-full" disabled>
              <Badge variant="secondary" className="mr-2">Sắp có</Badge>
              Tùy chỉnh giao diện
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Data & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5 text-gray-600" />
            Dữ liệu & Bảo mật
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" disabled>
              <Badge variant="secondary" className="mr-2">Sắp có</Badge>
              Xuất dữ liệu
            </Button>
            <Button variant="outline" disabled>
              <Badge variant="secondary" className="mr-2">Sắp có</Badge>
              Xóa tài khoản
            </Button>
            <Button variant="outline" disabled>
              <Badge variant="secondary" className="mr-2">Sắp có</Badge>
              Đổi mật khẩu
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Features */}
      <Card className="border-brand-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="mr-2 h-5 w-5 text-brand-500" />
            Tính năng AI
          </CardTitle>
          <CardDescription>
            Các tính năng thông minh cần đồng ý xử lý dữ liệu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-brand-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-brand-900">Tư vấn thực đơn AI</h3>
                <Badge variant={consents.ai_processing ? "default" : "secondary"}>
                  {consents.ai_processing ? 'Đã bật' : 'Tắt'}
                </Badge>
              </div>
              <p className="text-sm text-brand-700 mb-3">
                AI sẽ phân tích sở thích và đưa ra gợi ý thực đơn phù hợp cho người tiểu đường
              </p>
              {!consents.ai_processing && (
                <p className="text-xs text-amber-600">
                  Bật "Xử lý AI" ở mục Quyền riêng tư để sử dụng tính năng này
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
          <h1 className="text-3xl font-bold text-gray-900">Cài đặt</h1>
          <p className="text-gray-600 mt-1">Tùy chỉnh tài khoản và quyền riêng tư</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5 text-brand-500" />
              Thông tin cá nhân
            </CardTitle>
            <CardDescription>
              Quản lý thông tin tài khoản của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Email</Label>
              <p className="text-sm font-medium">{user?.email}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Tên hiển thị</Label>
              <p className="text-sm font-medium">{profile?.display_name || 'Chưa đặt'}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Múi giờ</Label>
              <p className="text-sm font-medium">{profile?.timezone || 'Asia/Bangkok'}</p>
            </div>
            <Button variant="outline" className="w-full" disabled>
              <Badge variant="secondary" className="mr-2">Sắp có</Badge>
              Chỉnh sửa thông tin
            </Button>
          </CardContent>
        </Card>

        {/* Privacy & Consent */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5 text-blue-500" />
              Quyền riêng tư
            </CardTitle>
            <CardDescription>
              Kiểm soát cách sử dụng dữ liệu của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Xử lý AI</Label>
                <p className="text-xs text-gray-500">Cho phép AI phân tích dữ liệu để đưa ra gợi ý</p>
              </div>
              <Switch
                checked={consents.ai_processing || false}
                onCheckedChange={(checked) => handleConsentChange('ai_processing', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Marketing</Label>
                <p className="text-xs text-gray-500">Nhận thông tin về sản phẩm và dịch vụ mới</p>
              </div>
              <Switch
                checked={consents.marketing || false}
                onCheckedChange={(checked) => handleConsentChange('marketing', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5 text-purple-500" />
              Thông báo
            </CardTitle>
            <CardDescription>
              Cài đặt nhắc nhở và thông báo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Push notifications</Label>
                <p className="text-xs text-gray-500">Nhận thông báo trên thiết bị</p>
              </div>
              <Switch disabled />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Email notifications</Label>
                <p className="text-xs text-gray-500">Nhận thông báo qua email</p>
              </div>
              <Switch disabled />
            </div>

            <Button variant="outline" className="w-full" disabled>
              <Badge variant="secondary" className="mr-2">Sắp có</Badge>
              Quản lý nhắc nhở
            </Button>
          </CardContent>
        </Card>

        {/* App Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="mr-2 h-5 w-5 text-orange-500" />
              Giao diện
            </CardTitle>
            <CardDescription>
              Tùy chỉnh giao diện ứng dụng
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Chế độ tối</Label>
                <p className="text-xs text-gray-500">Giao diện tối cho mắt</p>
              </div>
              <Switch disabled />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Ngôn ngữ</Label>
                <p className="text-xs text-gray-500">Tiếng Việt</p>
              </div>
              <Badge variant="outline">VN</Badge>
            </div>

            <Button variant="outline" className="w-full" disabled>
              <Badge variant="secondary" className="mr-2">Sắp có</Badge>
              Tùy chỉnh giao diện
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Data & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5 text-gray-600" />
            Dữ liệu & Bảo mật
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" disabled>
              <Badge variant="secondary" className="mr-2">Sắp có</Badge>
              Xuất dữ liệu
            </Button>
            <Button variant="outline" disabled>
              <Badge variant="secondary" className="mr-2">Sắp có</Badge>
              Xóa tài khoản
            </Button>
            <Button variant="outline" disabled>
              <Badge variant="secondary" className="mr-2">Sắp có</Badge>
              Đổi mật khẩu
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Features */}
      <Card className="border-brand-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="mr-2 h-5 w-5 text-brand-500" />
            Tính năng AI
          </CardTitle>
          <CardDescription>
            Các tính năng thông minh cần đồng ý xử lý dữ liệu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-brand-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-brand-900">Tư vấn thực đơn AI</h3>
                <Badge variant={consents.ai_processing ? "default" : "secondary"}>
                  {consents.ai_processing ? 'Đã bật' : 'Tắt'}
                </Badge>
              </div>
              <p className="text-sm text-brand-700 mb-3">
                AI sẽ phân tích sở thích và đưa ra gợi ý thực đơn phù hợp cho người tiểu đường
              </p>
              {!consents.ai_processing && (
                <p className="text-xs text-amber-600">
                  Bật "Xử lý AI" ở mục Quyền riêng tư để sử dụng tính năng này
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}