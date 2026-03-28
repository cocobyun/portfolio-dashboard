interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  color?: string;
  small?: boolean;
}

export default function KpiCard({ label, value, sub, color, small }: KpiCardProps) {
  return (
    <div className="card" style={{ minWidth: small ? 100 : 130 }}>
      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: small ? '1rem' : '1.25rem',
          fontWeight: 600,
          color: color || 'var(--text-primary)',
          fontFamily: 'JetBrains Mono, monospace',
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>
      )}
    </div>
  );
}
