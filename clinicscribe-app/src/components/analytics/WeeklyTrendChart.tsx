'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface WeeklyTrendChartProps {
  data: { week: string; count: number }[];
}

export function WeeklyTrendChart({ data }: WeeklyTrendChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-on-surface-variant text-center py-8">
        Not enough data to display a trend yet.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#006876" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#006876" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            fontSize: 13,
          }}
        />
        <Area
          type="monotone"
          dataKey="count"
          name="Consultations"
          stroke="#006876"
          strokeWidth={2}
          fill="url(#trendGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
