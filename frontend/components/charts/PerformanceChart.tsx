'use client';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { fmt } from '@/lib/format';

interface PerfPoint {
  date: string;
  nav: number;
  daily_return: number;
  cumulative_return: number;
  benchmark_return?: number;
  benchmark_cumul?: number;
}

interface Props {
  data: PerfPoint[];
  height?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--bg-border)',
      padding: '8px 12px',
      borderRadius: 4,
      fontSize: '0.75rem',
    }}>
      <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {p.value > 0 ? '+' : ''}{p.value?.toFixed(3)}%
        </div>
      ))}
    </div>
  );
};

export default function PerformanceChart({ data, height = 260 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(45,49,72,0.6)" />
        <XAxis
          dataKey="date"
          tickFormatter={d => fmt.shortDate(d)}
          tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
          tickFormatter={v => `${v.toFixed(1)}%`}
          width={45}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}
        />
        <ReferenceLine y={0} stroke="var(--bg-border)" strokeDasharray="3 3" />
        <Line
          type="monotone"
          dataKey="cumulative_return"
          name="포트폴리오"
          stroke="#4a7cf7"
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="benchmark_cumul"
          name="벤치마크"
          stroke="#9098b1"
          strokeWidth={1}
          strokeDasharray="4 2"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
