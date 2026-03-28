'use client';

interface Constraint {
  name: string;
  stock_name?: string;
  current_value?: number;
  expected_value?: number;
  status: string;
  violation_days: number;
  sanction_exemption: boolean;
  order_allowed: boolean;
  warning_line?: number;
  violation_line?: number;
  tolerance?: number;
  unit?: string;
}

interface Props {
  constraints: Constraint[];
}

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    정상: 'badge-normal',
    경고: 'badge-warning',
    위반: 'badge-violation',
    모니터링: 'badge-monitoring',
  };
  return `badge ${map[s] || 'badge-monitoring'}`;
};

export default function ConstraintTable({ constraints }: Props) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>항목</th>
            <th style={{ textAlign: 'left' }}>종목/섹터</th>
            <th>현재값</th>
            <th>증가예상</th>
            <th style={{ textAlign: 'center' }}>상태</th>
            <th>위반일수</th>
            <th style={{ textAlign: 'center' }}>제재유예</th>
            <th style={{ textAlign: 'center' }}>주문허용</th>
            <th>경고라인</th>
            <th>위반라인</th>
            <th>허용</th>
          </tr>
        </thead>
        <tbody>
          {constraints.map((c, i) => {
            const isWarn = c.status === '경고';
            const isViol = c.status === '위반';
            const rowBg = isViol
              ? 'rgba(224,82,82,0.07)'
              : isWarn
              ? 'rgba(245,166,35,0.07)'
              : 'transparent';

            return (
              <tr key={i} style={{ backgroundColor: rowBg }}>
                <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{c.name}</td>
                <td style={{ color: isWarn || isViol ? 'var(--accent-yellow)' : 'var(--text-secondary)' }}>
                  {c.stock_name || ''}
                </td>
                <td className={`num ${isWarn ? 'warn' : isViol ? 'viol' : ''}`}>
                  {c.current_value != null ? c.current_value.toFixed(2) : ''}
                </td>
                <td className="num">
                  {c.expected_value != null ? c.expected_value.toFixed(2) : ''}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {c.status !== '정상' && <span className={statusBadge(c.status)}>{c.status}</span>}
                </td>
                <td className="num">{c.violation_days > 0 ? c.violation_days : ''}</td>
                <td style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {c.sanction_exemption ? '유예 중' : ''}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {c.order_allowed ? (
                    <span style={{ color: '#2ecc88', fontSize: '0.72rem' }}>허용</span>
                  ) : (
                    <span style={{ color: '#e05252', fontSize: '0.72rem' }}>불가</span>
                  )}
                </td>
                <td className="num" style={{ color: 'var(--text-muted)' }}>
                  {c.warning_line != null ? `| ${c.warning_line}` : ''}
                </td>
                <td className="num" style={{ color: 'var(--text-muted)' }}>
                  {c.violation_line != null ? `| ${c.violation_line}` : ''}
                </td>
                <td className="num" style={{ color: 'var(--text-muted)' }}>
                  {c.tolerance != null ? c.tolerance : ''}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
