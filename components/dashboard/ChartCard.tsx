"use client";
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Dynamic import to avoid SSR hydration issues
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });

type Point = { d: string; v: number };

export function ChartCard({
  title,
  data,
  color = "#10b981",
  unit,
}: {
  title: string;
  data: Point[];
  color?: string;
  unit?: string;
}) {
  return (
    <Card className="hover:shadow-soft transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-gray-600">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[260px]">
        {typeof window !== 'undefined' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`grad-${title.replace(/\s+/g, '-')}`} x1="0\" y1="0\" x2="0\" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.5}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="d" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: any) => `${v}${unit ? " " + unit : ""}`} />
              <Area type="monotone" dataKey="v" stroke={color} fill={`url(#grad-${title.replace(/\s+/g, '-')})`} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}