'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ConsultationsByTypeChartProps {
  data: { type: string; count: number }[];
}

export function ConsultationsByTypeChart({ data }: ConsultationsByTypeChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-on-surface-variant text-center py-8">No data yet.</p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <YAxis
          dataKey="type"
          type="category"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          axisLine={false}
          tickLine={false}
          width={130}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            fontSize: 13,
          }}
        />
        <Bar dataKey="count" name="Consultations" fill="#006876" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
