'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Share2, Shield, Heart } from 'lucide-react';

export default function CarePage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gia đình</h1>
          <p className="text-gray-600 mt-1">Quản lý thành viên & chia sẻ dữ liệu sức khỏe</p>
        </div>
        <Button className="bg-brand-500 hover:bg-brand-600">
          <UserPlus className="mr-2 h-4 w-4" />
          Mời thành viên
        </Button>
      </div>

      {/* Feature Preview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-brand-200 bg-brand-50">
          <CardHeader>
            <CardTitle className="flex items-center text-brand-700">
              <Share2 className="mr-2 h-5 w-5" />
              Chia sẻ dữ liệu
            </CardTitle>
            <CardDescription>
              Cho phép người thân theo dõi chỉ số sức khỏe của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              Đang phát triển
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-700">
              <Shield className="mr-2 h-5 w-5" />
              Quyền riêng tư
            </CardTitle>
            <CardDescription>
              Kiểm soát ai có thể xem thông tin nào của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              Đang phát triển
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center text-purple-700">
              <Heart className="mr-2 h-5 w-5" />
              Chăm sóc từ xa
            </CardTitle>
            <CardDescription>
              Nhận cảnh báo khi có bất thường về sức khỏe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              Đang phát triển
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5 text-brand-500" />
            Tính năng sắp ra mắt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium">Mời người thân</h3>
                <p className="text-sm text-gray-600">Gửi lời mời qua email để chia sẻ dữ liệu</p>
              </div>
              <Badge variant="outline">Q2 2025</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium">Dashboard người thân</h3>
                <p className="text-sm text-gray-600">Xem tổng quan sức khỏe của thành viên gia đình</p>
              </div>
              <Badge variant="outline">Q2 2025</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium">Cảnh báo khẩn cấp</h3>
                <p className="text-sm text-gray-600">Thông báo tự động khi có chỉ số bất thường</p>
              </div>
              <Badge variant="outline">Q3 2025</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
        </div>
        <Button className="bg-brand-500 hover:bg-brand-600">
          <UserPlus className="mr-2 h-4 w-4" />
          Mời thành viên
        </Button>
      </div>

      {/* Feature Preview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-brand-200 bg-brand-50">
          <CardHeader>
            <CardTitle className="flex items-center text-brand-700">
              <Share2 className="mr-2 h-5 w-5" />
              Chia sẻ dữ liệu
            </CardTitle>
            <CardDescription>
              Cho phép người thân theo dõi chỉ số sức khỏe của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              Đang phát triển
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-700">
              <Shield className="mr-2 h-5 w-5" />
              Quyền riêng tư
            </CardTitle>
            <CardDescription>
              Kiểm soát ai có thể xem thông tin nào của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              Đang phát triển
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center text-purple-700">
              <Heart className="mr-2 h-5 w-5" />
              Chăm sóc từ xa
            </CardTitle>
            <CardDescription>
              Nhận cảnh báo khi có bất thường về sức khỏe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              Đang phát triển
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5 text-brand-500" />
            Tính năng sắp ra mắt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium">Mời người thân</h3>
                <p className="text-sm text-gray-600">Gửi lời mời qua email để chia sẻ dữ liệu</p>
              </div>
              <Badge variant="outline">Q2 2025</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium">Dashboard người thân</h3>
                <p className="text-sm text-gray-600">Xem tổng quan sức khỏe của thành viên gia đình</p>
              </div>
              <Badge variant="outline">Q2 2025</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium">Cảnh báo khẩn cấp</h3>
                <p className="text-sm text-gray-600">Thông báo tự động khi có chỉ số bất thường</p>
              </div>
              <Badge variant="outline">Q3 2025</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}