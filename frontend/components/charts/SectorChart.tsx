'use client';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const COLORS = [
  '#4a7cf7', '#2ecc88', '#f5a623', '#9b6bfa', '#2bc4d8',
  '#e05252', '#5cb85c', '#f0ad4e', '#5bc0de', '#d9534f',
];

interface SectorItem {
  sector: string;
  weight: number;
  amount: number;
}

interface Props {
  data: SectorItem[];
  type?: 'pie' | 'bar';
  height?: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--bg-border)',
      padding: '6px 10px',
      borderRadius: 4,
      fontSize: '0.75rem',
    }}>
      <div style={{ fontWeight: 600 }}>{d.sector}</div>
      <div style={{ color: 'var(--text-secondary)' }}>{d.weight?.toFixed(2)}%</div>
    </div>
  );
};

export default function SectorChart({ data, type = 'pie', height = 220 }: Props) {
  if (type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20, top: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(45,49,72,0.6)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
            tickFormatter={v => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="sector"
            tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="weight" radius={[0, 2, 2, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="weight"
          nameKey="sector"
          cx="50%"
          cy="50%"
          outerRadius={80}
          innerRadius={40}
          paddingAngle={2}
          label={({ sector, weight }) => `${sector} ${weight?.toFixed(1)}%`}
          labelLine={false}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
