'use client';
import { useState } from 'react';

export default function TopBar() {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [account, setAccount] = useState('문주성');
  const [strategy, setStrategy] = useState('RFM_BM');

  return (
    <header
      style={{
        height: 44,
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--bg-border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 12,
        flexShrink: 0,
      }}
    >
      {/* 날짜 */}
      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        style={{ width: 130, fontSize: '0.78rem' }}
      />

      {/* 계정 */}
      <select
        value={account}
        onChange={e => setAccount(e.target.value)}
        style={{ fontSize: '0.78rem' }}
      >
        <option>문주성</option>
        <option>계정2</option>
      </select>

      {/* 전략 */}
      <select
        value={strategy}
        onChange={e => setStrategy(e.target.value)}
        style={{ fontSize: '0.78rem' }}
      >
        <option>RFM_BM</option>
        <option>전략2</option>
      </select>

      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        RFM03BM &nbsp; RFMBM
      </span>

      {/* 구분선 */}
      <div style={{ width: 1, height: 20, background: 'var(--bg-border)', margin: '0 4px' }} />

      {/* 성과 요약 */}
      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
        당일 회전율&nbsp;
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>0%</span>
      </span>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
        현금 소진율&nbsp;
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>( | ) / %</span>
      </span>

      {/* 우측 */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          style={{
            fontSize: '0.7rem',
            background: 'rgba(224,82,82,0.15)',
            color: '#e05252',
            padding: '2px 8px',
            borderRadius: 3,
            fontWeight: 600,
          }}
        >
          ● READ ONLY
        </span>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          {account} / 가상/RFM
        </span>
      </div>
    </header>
  );
}
