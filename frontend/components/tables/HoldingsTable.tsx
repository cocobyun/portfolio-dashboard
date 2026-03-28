'use client';
import { useState } from 'react';
import { fmt, retClass } from '@/lib/format';

interface Holding {
  code: string;
  name: string;
  market?: string;
  sector?: string;
  group?: string;
  ls: string;
  qty: number;
  avg_price: number;
  current_price: number;
  eval_amount: number;
  eval_profit: number;
  profit_rate: number;
  current_weight: number;
  target_weight: number;
  weight_diff: number;
  order_qty: number;
  order_amount: number;
  sz?: string;
  sec?: string;
  std_score_1d?: number;
  std_score_5d?: number;
  std_score_12fw?: number;
  price_score?: number;
  quant_score?: number;
  estimate_change_prev?: number;
  estimate_change_5d?: number;
}

interface Props {
  holdings: Holding[];
  showColumns?: 'basic' | 'scores' | 'orders';
  title?: string;
}

export default function HoldingsTable({ holdings, showColumns = 'basic', title }: Props) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<keyof Holding>('current_weight');
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = holdings
    .filter(h =>
      !search || h.name.includes(search) || h.code.includes(search)
    )
    .sort((a, b) => {
      const av = a[sortKey] as number;
      const bv = b[sortKey] as number;
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortAsc ? av - bv : bv - av;
      }
      return 0;
    });

  const handleSort = (key: keyof Holding) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortTh = ({ k, label }: { k: keyof Holding; label: string }) => (
    <th
      onClick={() => handleSort(k)}
      style={{ cursor: 'pointer', userSelect: 'none' }}
    >
      {label}
      {sortKey === k && (
        <span style={{ marginLeft: 3, color: 'var(--accent-blue)' }}>
          {sortAsc ? '↑' : '↓'}
        </span>
      )}
    </th>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        {title && (
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {title}
          </span>
        )}
        <input
          type="text"
          placeholder="Search all columns..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 180 }}
        />
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          선택 0 | 필터 - | 전체 {filtered.length} | 합계 0
        </span>
      </div>
      <div style={{ overflowX: 'auto', maxHeight: 420, overflowY: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'center', width: 28 }}>#</th>
              <th style={{ textAlign: 'left' }}>코드</th>
              <th style={{ textAlign: 'left' }}>명</th>
              <SortTh k="current_price" label="Last" />
              <SortTh k="profit_rate" label="Ch%" />
              <SortTh k="current_weight" label="장전" />
              <th>주문합</th>
              <SortTh k="target_weight" label="타겟" />
              <th>체결률</th>
              <th>체결가</th>
              <th>Sz</th>
              <th>Sec</th>
              <th style={{ textAlign: 'left' }}>그룹</th>
              {showColumns === 'scores' && (
                <>
                  <th>기여</th>
                  <th>델타</th>
                  <th>전일</th>
                  <th>5일</th>
                  <th>12Fw</th>
                  <th>Q</th>
                  <th>5일</th>
                  <th>20일</th>
                </>
              )}
              {showColumns === 'orders' && (
                <>
                  <SortTh k="weight_diff" label="비중차" />
                  <SortTh k="order_qty" label="주문수량" />
                  <SortTh k="order_amount" label="주문금액" />
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((h, i) => (
              <tr key={h.code}>
                <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{i + 1}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{h.code}</td>
                <td style={{ fontWeight: 500 }}>{h.name}</td>
                <td className="num">{fmt.price(h.current_price)}</td>
                <td className={`num ${retClass(h.profit_rate)}`}>{fmt.ret(h.profit_rate)}</td>
                <td className="num">{fmt.pct(h.current_weight)}</td>
                <td className="num" style={{ color: 'var(--text-muted)' }}>-</td>
                <td className="num" style={{ fontWeight: 600 }}>{fmt.pct(h.target_weight)}</td>
                <td className="num" style={{ color: 'var(--text-muted)' }}>-</td>
                <td className="num" style={{ color: 'var(--text-muted)' }}>-</td>
                <td style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{h.sz || ''}</td>
                <td style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{h.sec || ''}</td>
                <td style={{ fontSize: '0.72rem', color: 'var(--accent-blue)', textAlign: 'left' }}>{h.group || ''}</td>
                {showColumns === 'scores' && (
                  <>
                    <td className="num">{h.std_score_1d?.toFixed(2) ?? '-'}</td>
                    <td className="num">{'-'}</td>
                    <td>{'-'}</td>
                    <td>{'-'}</td>
                    <td>{'-'}</td>
                    <td>{'-'}</td>
                    <td>{'-'}</td>
                    <td>{'-'}</td>
                  </>
                )}
                {showColumns === 'orders' && (
                  <>
                    <td className={`num ${h.weight_diff > 0 ? 'pos' : h.weight_diff < 0 ? 'neg' : ''}`}>
                      {fmt.ret(h.weight_diff)}
                    </td>
                    <td className="num">{h.order_qty !== 0 ? fmt.qty(h.order_qty) : '-'}</td>
                    <td className="num">{h.order_amount !== 0 ? fmt.billion(h.order_amount) : '-'}</td>
                  </>
                )}
              </tr>
            ))}
            <tr style={{ backgroundColor: 'var(--bg-secondary)', fontWeight: 600 }}>
              <td colSpan={3} style={{ textAlign: 'left', color: 'var(--text-muted)' }}>Sum</td>
              <td></td>
              <td></td>
              <td className="num">{fmt.pct(filtered.reduce((s, h) => s + h.current_weight, 0))}</td>
              <td></td>
              <td className="num">{fmt.pct(filtered.reduce((s, h) => s + h.target_weight, 0))}</td>
              <td colSpan={showColumns === 'orders' ? 8 : 5}></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
