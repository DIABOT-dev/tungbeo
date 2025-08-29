'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, ArrowRight, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { consentSchema } from '@/lib/validation';
import { toast } from 'sonner';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [formData, setFormData] = useState({
    displayName: '',
    timezone: 'Asia/Bangkok',
    baselineA1c: '',
    targetGlucoseMin: '70',
    targetGlucoseMax: '180',
    acceptTos: false,
    acceptPrivacy: false,
    aiProcessing: false,
    marketing: false,
    healthGoal: ''
  });
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }

      // Check if already completed onboarding
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_status')
        .eq('id', session.user.id)
        .single();

      if (profile?.onboarding_status === 'completed') {
        router.push('/dashboard');
      }
    };
    checkAuth();
  }, [router]);

  const handleNext = () => {
    setErrors({});
    
    // Validate current step
    if (step === 1) {
      const stepErrors: any = {};
      if (!formData.displayName.trim()) {
        stepErrors.displayName = 'Tên hiển thị là bắt buộc';
      }
      if (!formData.timezone) {
        stepErrors.timezone = 'Múi giờ là bắt buộc';
      }
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        return;
      }
    }
    
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    // Final validation
    try {
      consentSchema.parse(formData);
    } catch (error: any) {
      const fieldErrors: any = {};
      error.errors?.forEach((err: any) => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Direct Supabase operations (no API route - avoid JSON parsing errors)
      console.log('[Onboarding] Updating profile for user:', session.user.id);
      
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          email: session.user.email!,
          display_name: formData.displayName,
          timezone: formData.timezone,
          baseline_a1c: formData.baselineA1c ? parseFloat(formData.baselineA1c) : null,
          target_glucose_min: parseInt(formData.targetGlucoseMin),
          target_glucose_max: parseInt(formData.targetGlucoseMax),
          health_goal: formData.healthGoal,
          onboarding_status: 'completed',
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (profileError) {
        console.error('[Onboarding] Profile update error:', profileError);
        throw new Error(profileError.message);
      }

      // Save consents
      const consents = [
        { user_id: session.user.id, kind: 'tos', granted: formData.acceptTos },
        { user_id: session.user.id, kind: 'privacy', granted: formData.acceptPrivacy },
        { user_id: session.user.id, kind: 'ai_processing', granted: formData.aiProcessing },
        { user_id: session.user.id, kind: 'marketing', granted: formData.marketing },
      ];

      for (const consent of consents) {
        const { error: consentError } = await supabase
          .from('consents')
          .upsert({
            ...consent,
            granted_at: consent.granted ? new Date().toISOString() : null,
          }, { onConflict: 'user_id,kind' });

        if (consentError) {
          console.error('[Onboarding] Consent error:', consentError);
          // Continue with other consents even if one fails
        }
      }

      console.log('[Onboarding] Completed successfully');

      toast.success('Thiết lập hoàn tất!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Tên hiển thị *</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="Nhập tên hiển thị của bạn"
                className={errors.displayName ? 'border-red-500' : ''}
              />
              {errors.displayName && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.displayName}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Múi giờ *</Label>
              <Select 
                value={formData.timezone} 
                onValueChange={(value) => setFormData({ ...formData, timezone: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Bangkok">Asia/Bangkok (GMT+7)</SelectItem>
                  <SelectItem value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</SelectItem>
                  <SelectItem value="Asia/Singapore">Asia/Singapore (GMT+8)</SelectItem>
                </SelectContent>
              </Select>
              {errors.timezone && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.timezone}
                </p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="healthGoal">Mục tiêu sức khỏe</Label>
              <Select value={formData.healthGoal} onValueChange={(value) => setFormData({ ...formData, healthGoal: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn mục tiêu chính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stable_glucose">Ổn định đường huyết</SelectItem>
                  <SelectItem value="reduce_hba1c">Giảm HbA1c</SelectItem>
                  <SelectItem value="weight_management">Quản lý cân nặng</SelectItem>
                  <SelectItem value="lifestyle_improvement">Cải thiện lối sống</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="baselineA1c">HbA1c hiện tại (tùy chọn)</Label>
              <Input
                id="baselineA1c"
                type="number"
                step="0.1"
                min="4"
                max="15"
                value={formData.baselineA1c}
                onChange={(e) => setFormData({ ...formData, baselineA1c: e.target.value })}
                placeholder="Ví dụ: 7.2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetMin">Đường huyết tối thiểu (mg/dL)</Label>
                <Input
                  id="targetMin"
                  type="number"
                  value={formData.targetGlucoseMin}
                  onChange={(e) => setFormData({ ...formData, targetGlucoseMin: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetMax">Đường huyết tối đa (mg/dL)</Label>
                <Input
                  id="targetMax"
                  type="number"
                  value={formData.targetGlucoseMax}
                  onChange={(e) => setFormData({ ...formData, targetGlucoseMax: e.target.value })}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-6">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-900 mb-3">Điều khoản bắt buộc *</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="acceptTos"
                      checked={formData.acceptTos}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, acceptTos: checked as boolean })
                      }
                      className={errors.acceptTos ? 'border-red-500' : ''}
                    />
                    <Label htmlFor="acceptTos" className="text-sm leading-5">
                      Tôi đồng ý với <a href="/terms" target="_blank" className="text-blue-600 underline">Điều khoản sử dụng</a>
                    </Label>
                  </div>
                  {errors.acceptTos && (
                    <p className="text-sm text-red-500 flex items-center ml-6">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.acceptTos}
                    </p>
                  )}
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="acceptPrivacy"
                      checked={formData.acceptPrivacy}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, acceptPrivacy: checked as boolean })
                      }
                      className={errors.acceptPrivacy ? 'border-red-500' : ''}
                    />
                    <Label htmlFor="acceptPrivacy" className="text-sm leading-5">
                      Tôi đồng ý với <a href="/privacy" target="_blank" className="text-blue-600 underline">Chính sách bảo mật</a>
                    </Label>
                  </div>
                  {errors.acceptPrivacy && (
                    <p className="text-sm text-red-500 flex items-center ml-6">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.acceptPrivacy}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-3">Tùy chọn bổ sung</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="aiProcessing"
                      checked={formData.aiProcessing}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, aiProcessing: checked as boolean })
                      }
                    />
                    <Label htmlFor="aiProcessing" className="text-sm leading-5">
                      Tôi đồng ý cho phép xử lý dữ liệu bằng AI để cải thiện trải nghiệm
                    </Label>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="marketing"
                      checked={formData.marketing}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, marketing: checked as boolean })
                      }
                    />
                    <Label htmlFor="marketing" className="text-sm leading-5">
                      Tôi muốn nhận thông tin về sản phẩm và dịch vụ mới
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center space-y-4">
            <Heart className="h-16 w-16 text-red-500 mx-auto" />
            <h3 className="text-xl font-semibold">Sẵn sàng bắt đầu!</h3>
            <p className="text-gray-600">
              Chúng tôi đã thiết lập tài khoản của bạn. Hãy bắt đầu hành trình quản lý sức khỏe!
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Thiết lập tài khoản</CardTitle>
          <CardDescription>
            Bước {step} / 4: {
              step === 1 ? 'Thông tin cơ bản' :
              step === 2 ? 'Mục tiêu sức khỏe' :
              step === 3 ? 'Điều khoản & Quyền riêng tư' :
              'Hoàn tất'
            }
          </CardDescription>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderStep()}
          
          <div className="flex justify-between">
            {step > 1 && (
              <Button 
                variant="outline" 
                onClick={() => setStep(step - 1)}
                disabled={loading}
              >
                Quay lại
              </Button>
            )}
            <Button 
              onClick={handleNext}
              disabled={loading}
              className={step === 1 ? 'w-full' : 'ml-auto'}
            >
              {loading ? 'Đang xử lý...' : step === 4 ? 'Hoàn tất' : 'Tiếp tục'}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}