"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

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
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.5}/>
                <stop offset="95%" stopColor={color} stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="d" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: any) => `${v}${unit ? " " + unit : ""}`} />
            <Area type="monotone" dataKey="v" stroke={color} fill="url(#grad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}