'use client';
import { useEffect, useState, useCallback } from 'react';
import { fetchPortfolioAnalysis } from '@/lib/api';
import { fmt, retClass } from '@/lib/format';
import KpiCard from '@/components/cards/KpiCard';
import PerformanceChart from '@/components/charts/PerformanceChart';
import SectorChart from '@/components/charts/SectorChart';

const DAYS_OPTIONS = [30, 60, 90, 180, 365];

export default function AnalysisPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(90);
  const [sectorView, setSectorView] = useState<'pie' | 'bar'>('bar');
  const [contribTab, setContribTab] = useState<'long' | 'short'>('long');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchPortfolioAnalysis(days);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { load(); }, [load]);

  const s = data?.summary;
  const perf = data?.performance || [];
  const sectors = data?.sectors || [];
  const contribution = data?.contribution || [];
  const longContrib = contribution.filter((c: any) => c.ls === 'L');
  const shortContrib = contribution.filter((c: any) => c.ls === 'S');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* 기간 선택 바 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>기간:</span>
        {DAYS_OPTIONS.map(d => (
          <button
            key={d}
            className={`btn ${days === d ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setDays(d)}
          >
            {d}일
          </button>
        ))}
        <button className="btn btn-secondary" onClick={load} style={{ marginLeft: 8 }}>
          ↻ 조회
        </button>
      </div>

      {/* KPI 카드 행 */}
      {s && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <KpiCard label="NAV" value={s.nav?.toFixed(2) || '-'} />
          <KpiCard
            label="일간 수익률"
            value={fmt.ret(s.nav_change_rate)}
            color={s.nav_change_rate >= 0 ? 'var(--accent-red)' : 'var(--accent-blue)'}
          />
          <KpiCard label="총 평가손익" value={fmt.trillion(s.total_profit)} />
          <KpiCard label="총수익률" value={fmt.ret(s.total_profit_rate)}
            color={s.total_profit_rate >= 0 ? 'var(--accent-red)' : 'var(--accent-blue)'} />
          <KpiCard label="총자산" value={fmt.trillion(s.total_asset)} />
          <KpiCard label="현금" value={fmt.trillion(s.cash)} small />
          <KpiCard label="롱 익스포저" value={fmt.pct(s.long_exposure)} small />
          <KpiCard label="숏 익스포저" value={fmt.pct(s.short_exposure)} small />
          <KpiCard label="순익스포저" value={fmt.pct(s.net_exposure)} small />
          <KpiCard label="코스닥 비중" value={fmt.pct(s.kosdaq_weight)} small />
        </div>
      )}

      {/* 차트 행 */}
      <div style={{ display: 'flex', gap: 12 }}>
        {/* 성과 차트 */}
        <div className="card" style={{ flex: 2 }}>
          <div className="section-title">일별 누적 수익률</div>
          {loading ? (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              로딩 중...
            </div>
          ) : (
            <PerformanceChart data={perf} height={260} />
          )}
        </div>

        {/* 섹터 차트 */}
        <div className="card" style={{ flex: 1, minWidth: 240 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <span className="section-title" style={{ margin: 0, borderBottom: 'none' }}>섹터 비중</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
              <button className={`btn ${sectorView === 'bar' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSectorView('bar')} style={{ padding: '3px 8px', fontSize: '0.68rem' }}>
                Bar
              </button>
              <button className={`btn ${sectorView === 'pie' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSectorView('pie')} style={{ padding: '3px 8px', fontSize: '0.68rem' }}>
                Pie
              </button>
            </div>
          </div>
          {loading ? (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              로딩 중...
            </div>
          ) : (
            <SectorChart data={sectors} type={sectorView} height={220} />
          )}
        </div>
      </div>

      {/* 기여도 + 시장 분포 행 */}
      <div style={{ display: 'flex', gap: 12 }}>
        {/* 종목별 기여도 테이블 */}
        <div className="card" style={{ flex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div className="section-title" style={{ margin: 0, borderBottom: 'none' }}>종목별 기여도</div>
            <button
              className={`btn ${contribTab === 'long' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setContribTab('long')}
            >Long</button>
            <button
              className={`btn ${contribTab === 'short' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setContribTab('short')}
            >Short</button>
          </div>
          <div style={{ maxHeight: 280, overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>종목</th>
                  <th style={{ textAlign: 'left' }}>섹터</th>
                  <th style={{ textAlign: 'left' }}>시장</th>
                  <th>비중</th>
                  <th>평가손익</th>
                  <th>수익률</th>
                </tr>
              </thead>
              <tbody>
                {(contribTab === 'long' ? longContrib : shortContrib).map((c: any) => (
                  <tr key={c.code}>
                    <td style={{ fontWeight: 500 }}>{c.name}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{c.sector}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{c.market}</td>
                    <td className="num">{fmt.pct(c.current_weight)}</td>
                    <td className={`num ${retClass(c.eval_profit)}`}>
                      {fmt.billion(c.eval_profit)}
                    </td>
                    <td className={`num ${retClass(c.profit_rate)}`}>
                      {fmt.ret(c.profit_rate)}
                    </td>
                  </tr>
                ))}
                {(contribTab === 'long' ? longContrib : shortContrib).length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 16 }}>
                      데이터 없음
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 시장/롱숏 비중 */}
        <div className="card" style={{ flex: 1, minWidth: 200 }}>
          <div className="section-title">시장별 비중</div>
          {s && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
              {[
                { label: 'KOSPI', value: (s.stock_weight || 0) - (s.kosdaq_weight || 0) },
                { label: 'KOSDAQ', value: s.kosdaq_weight },
                { label: '현금', value: s.cash_weight },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: '0.78rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>{fmt.pct(value)}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(100, value || 0)}%`,
                      background: label === '현금' ? 'var(--accent-yellow)' :
                                  label === 'KOSDAQ' ? 'var(--accent-purple)' : 'var(--accent-blue)',
                      borderRadius: 3,
                    }} />
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--bg-border)' }}>
                <div className="section-title" style={{ fontSize: '0.68rem' }}>노출도 요약</div>
                {[
                  { label: '롱 익스포저', value: s.long_exposure },
                  { label: '숏 익스포저', value: s.short_exposure },
                  { label: '순익스포저', value: s.net_exposure },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.78rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{fmt.pct(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
