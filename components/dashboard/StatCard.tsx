import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

type Props = {
  title: string;
  value: string | number;
  unit?: string;
  hint?: string;
  icon?: ReactNode;
};

export function StatCard({ title, value, unit, hint, icon }: Props) {
  return (
    <Card className="hover:shadow-soft transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm text-gray-600">{title}</CardTitle>
        <div>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">
          {value ?? "--"} {unit && <span className="text-sm text-gray-500">{unit}</span>}
        </div>
        {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
      </CardContent>
    </Card>
  );
}