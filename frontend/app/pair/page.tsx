'use client';
import { useState, useCallback } from 'react';
import { fetchPairData } from '@/lib/api';
import { fmt } from '@/lib/format';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine, BarChart, Bar,
} from 'recharts';

const PRESETS = [
  { a: 'A005930', b: 'A000660', label: '삼성전자 / SK하이닉스' },
  { a: 'A005380', b: 'A000270', label: '현대차 / 기아' },
];

export default function PairPage() {
  const [codeA, setCodeA] = useState('A005930');
  const [codeB, setCodeB] = useState('A000660');
  const [days, setDays] = useState(120);
  const [window, setWindow] = useState(20);
  const [basis, setBasis] = useState<'fixed' | 'dynamic'>('dynamic');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState<any>(null);

  const load = useCallback(async () => {
    if (!codeA || !codeB) return;
    setLoading(true);
    try {
      const res = await fetchPairData(codeA, codeB, days, window);
      setData(res.data || []);
      setMeta(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [codeA, codeB, days, window]);

  // 차트용 데이터: 5일 샘플링
  const chartData = data.filter((_: any, i: number) => i % 3 === 0);

  // 최신 지표
  const latest = data[data.length - 1];
  const stats = latest ? [
    { label: '헤지 비율', value: latest.hedge_ratio?.toFixed(4) },
    { label: '현재 스프레드', value: latest.spread?.toFixed(2) },
    { label: '스프레드 평균', value: latest.spread_mean?.toFixed(2) },
    { label: '상관계수', value: latest.correlation?.toFixed(4) },
    { label: 'z-score',
      value: latest.spread_mean != null && latest.spread != null
        ? ((latest.spread - latest.spread_mean) /
           Math.max(0.01, (latest.spread_upper - latest.spread_mean) / 2)).toFixed(3)
        : '-'
    },
  ] : [];

  const TooltipStyle = {
    contentStyle: { background: 'var(--bg-card)', border: '1px solid var(--bg-border)', fontSize: 11 },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* 파라미터 패널 */}
      <div className="card" style={{ padding: '10px 14px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 2 }}>종목 A</div>
            <input
              type="text"
              value={codeA}
              onChange={e => setCodeA(e.target.value)}
              style={{ width: 120 }}
              placeholder="A005930"
            />
          </div>
          <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)', paddingTop: 16 }}>⇄</div>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 2 }}>종목 B</div>
            <input
              type="text"
              value={codeB}
              onChange={e => setCodeB(e.target.value)}
              style={{ width: 120 }}
              placeholder="A000660"
            />
          </div>
          <div style={{ width: 1, height: 36, background: 'var(--bg-border)' }} />
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 2 }}>기간 (일)</div>
            <input type="number" value={days} onChange={e => setDays(+e.target.value)}
              style={{ width: 70 }} min={20} max={365} />
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 2 }}>윈도우</div>
            <input type="number" value={window} onChange={e => setWindow(+e.target.value)}
              style={{ width: 60 }} min={5} max={60} />
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 2 }}>헤지 비율</div>
            <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
              <button className={`btn ${basis === 'fixed' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setBasis('fixed')}>고정</button>
              <button className={`btn ${basis === 'dynamic' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setBasis('dynamic')}>동적</button>
            </div>
          </div>
          <div style={{ width: 1, height: 36, background: 'var(--bg-border)' }} />
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 2 }}>프리셋</div>
            <select
              onChange={e => {
                const p = PRESETS[+e.target.value];
                if (p) { setCodeA(p.a); setCodeB(p.b); }
              }}
              style={{ width: 180 }}
            >
              <option value="">직접 입력</option>
              {PRESETS.map((p, i) => (
                <option key={i} value={i}>{p.label}</option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" onClick={load} style={{ marginTop: 14 }}>
            분석 실행
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>분석 중...</div>
      ) : data.length > 0 ? (
        <>
          {/* 지표 카드 */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {stats.map(({ label, value }) => (
              <div key={label} className="card" style={{ minWidth: 110 }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, fontFamily: 'monospace' }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            {/* 좌측: 가격 차트 + 스프레드 차트 */}
            <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* 가격 */}
              <div className="card">
                <div className="section-title">가격 추이 ({codeA} vs {codeB})</div>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={chartData} margin={{ top: 4, right: 12, left: -8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(45,49,72,0.5)" />
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--text-muted)' }}
                      tickFormatter={d => d?.slice(5)} interval={20} />
                    <YAxis yAxisId="a" orientation="left" tick={{ fontSize: 9, fill: '#4a7cf7' }} width={55}
                      tickFormatter={v => v.toLocaleString()} />
                    <YAxis yAxisId="b" orientation="right" tick={{ fontSize: 9, fill: '#f5a623' }} width={55}
                      tickFormatter={v => v.toLocaleString()} />
                    <Tooltip {...TooltipStyle} formatter={(v: any) => v?.toLocaleString()} />
                    <Legend wrapperStyle={{ fontSize: '0.68rem' }} />
                    <Line yAxisId="a" type="monotone" dataKey="price_a" name={codeA}
                      stroke="#4a7cf7" strokeWidth={1.5} dot={false} />
                    <Line yAxisId="b" type="monotone" dataKey="price_b" name={codeB}
                      stroke="#f5a623" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* 스프레드 */}
              <div className="card">
                <div className="section-title">스프레드 (± 2σ 밴드)</div>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={chartData} margin={{ top: 4, right: 12, left: -8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(45,49,72,0.5)" />
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--text-muted)' }}
                      tickFormatter={d => d?.slice(5)} interval={20} />
                    <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} width={55} />
                    <Tooltip {...TooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: '0.68rem' }} />
                    <ReferenceLine y={0} stroke="var(--bg-border)" />
                    <Line type="monotone" dataKey="spread_upper" name="+2σ"
                      stroke="#e05252" strokeWidth={0.8} dot={false} strokeDasharray="4 2" />
                    <Line type="monotone" dataKey="spread_mean" name="평균"
                      stroke="#9098b1" strokeWidth={1} dot={false} strokeDasharray="3 2" />
                    <Line type="monotone" dataKey="spread_lower" name="-2σ"
                      stroke="#4a7cf7" strokeWidth={0.8} dot={false} strokeDasharray="4 2" />
                    <Line type="monotone" dataKey="spread" name="스프레드"
                      stroke="#2ecc88" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 우측: 헤지 비율 + 상관관계 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 200 }}>
              <div className="card">
                <div className="section-title">헤지 비율</div>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(45,49,72,0.5)" />
                    <XAxis dataKey="date" tick={{ fontSize: 8, fill: 'var(--text-muted)' }}
                      tickFormatter={d => d?.slice(5)} interval={25} />
                    <YAxis tick={{ fontSize: 8, fill: 'var(--text-muted)' }} width={40} />
                    <Tooltip {...TooltipStyle} />
                    <Line type="monotone" dataKey="hedge_ratio" name="HR"
                      stroke="#9b6bfa" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="card">
                <div className="section-title">상관관계 (rolling {window}d)</div>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(45,49,72,0.5)" />
                    <XAxis dataKey="date" tick={{ fontSize: 8, fill: 'var(--text-muted)' }}
                      tickFormatter={d => d?.slice(5)} interval={25} />
                    <YAxis tick={{ fontSize: 8, fill: 'var(--text-muted)' }} width={35}
                      domain={[-1, 1]} />
                    <Tooltip {...TooltipStyle} />
                    <ReferenceLine y={0} stroke="var(--bg-border)" />
                    <Line type="monotone" dataKey="correlation" name="상관"
                      stroke="#2bc4d8" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          종목 A, B를 입력하고 분석 실행 버튼을 눌러주세요.
        </div>
      )}
    </div>
  );
}
