'use client';
import { useState, useCallback } from 'react';
import { fetchFinancials, fetchInvestorFlow, fetchPbrBand, searchStock } from '@/lib/api';
import { fmt, retClass } from '@/lib/format';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts';

export default function ResearchPage() {
  const [code, setCode] = useState('A005930');
  const [inputCode, setInputCode] = useState('A005930');
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [mode, setMode] = useState<'annual' | 'quarterly'>('annual');
  const [profitBasis, setProfitBasis] = useState<'op' | 'net'>('op');
  const [financials, setFinancials] = useState<any>(null);
  const [investorFlow, setInvestorFlow] = useState<any[]>([]);
  const [pbrBand, setPbrBand] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [stockInfo, setStockInfo] = useState<any>(null);

  const load = useCallback(async (c: string) => {
    setLoading(true);
    try {
      const [fin, inv, pbr] = await Promise.all([
        fetchFinancials(c),
        fetchInvestorFlow(c, 60),
        fetchPbrBand(c),
      ]);
      setFinancials(fin);
      setInvestorFlow(inv.data || []);
      setPbrBand(pbr);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = async () => {
    if (!searchQ) return;
    const res = await searchStock(searchQ);
    setSearchResults(res.results || []);
  };

  const handleSelect = (info: any) => {
    setCode(info.code);
    setInputCode(info.code);
    setStockInfo(info);
    setSearchResults([]);
    setSearchQ('');
    load(info.code);
  };

  const handleLoad = () => {
    setCode(inputCode);
    load(inputCode);
  };

  const records = financials ? (mode === 'annual' ? financials.annual : financials.quarterly) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* 검색 바 */}
      <div className="card" style={{ padding: '10px 14px' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="종목코드 또는 종목명"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              style={{ width: 180 }}
            />
            {searchResults.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                background: 'var(--bg-card)',
                border: '1px solid var(--bg-border)',
                borderRadius: 4,
                zIndex: 100,
                minWidth: 200,
              }}>
                {searchResults.map((r: any) => (
                  <div
                    key={r.code}
                    onClick={() => handleSelect(r)}
                    style={{
                      padding: '6px 10px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      borderBottom: '1px solid var(--bg-border)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                  >
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginRight: 8 }}>{r.code}</span>
                    {r.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="btn btn-secondary" onClick={handleSearch}>검색</button>
          <div style={{ width: 1, height: 20, background: 'var(--bg-border)' }} />
          <input
            type="text"
            value={inputCode}
            onChange={e => setInputCode(e.target.value)}
            style={{ width: 120 }}
            placeholder="종목코드 직접입력"
            onKeyDown={e => e.key === 'Enter' && handleLoad()}
          />
          <select style={{ width: 70 }}>
            <option>12월</option>
            <option>3월</option>
            <option>6월</option>
          </select>
          <button
            className={`btn ${profitBasis === 'op' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setProfitBasis('op')}
          >영업이익</button>
          <button
            className={`btn ${profitBasis === 'net' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setProfitBasis('net')}
          >순이익</button>
          <button className="btn btn-primary" onClick={handleLoad}>조회</button>
          {stockInfo && (
            <span style={{ fontSize: '0.9rem', fontWeight: 600, marginLeft: 8 }}>
              {stockInfo.name}
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 6 }}>
                {stockInfo.market} | {stockInfo.sector}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
          데이터 로딩 중...
        </div>
      ) : financials ? (
        <>
          {/* 재무 테이블 */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div className="section-title" style={{ margin: 0, borderBottom: 'none' }}>재무제표</div>
              <button
                className={`btn ${mode === 'annual' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setMode('annual')}
              >연간</button>
              <button
                className={`btn ${mode === 'quarterly' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setMode('quarterly')}
              >분기</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', width: 80 }}>구분</th>
                    {records.map((r: any) => (
                      <th key={r.period}>{r.period}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { key: 'revenue', label: '매출 (억)' },
                    { key: 'revenue_growth', label: '성장률 (%)' },
                    { key: 'op_profit', label: '영업이익 (억)' },
                    { key: 'op_margin', label: '영업이익률 (%)' },
                    { key: 'net_profit', label: '순이익 (억)' },
                    { key: 'roe', label: 'ROE (%)' },
                    { key: 'per', label: 'PER' },
                    { key: 'pbr', label: 'PBR' },
                    { key: 'dps', label: 'DPS (원)' },
                  ].map(({ key, label }) => (
                    <tr key={key}>
                      <td style={{ textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                        {label}
                      </td>
                      {records.map((r: any) => {
                        const v = r[key];
                        const isGrowth = key === 'revenue_growth' || key === 'roe';
                        const formatted = v == null ? '-'
                          : key === 'revenue' || key === 'op_profit' || key === 'net_profit'
                          ? fmt.billion(v * 1e8)
                          : key === 'dps'
                          ? fmt.price(v)
                          : key === 'revenue_growth' || key === 'op_margin' || key === 'roe'
                          ? `${v?.toFixed(1)}%`
                          : v?.toFixed(2);
                        return (
                          <td
                            key={r.period}
                            className={`num ${isGrowth && v > 0 ? 'pos' : isGrowth && v < 0 ? 'neg' : ''}`}
                          >
                            {formatted}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 차트 행 */}
          <div style={{ display: 'flex', gap: 12 }}>
            {/* PBR 밴드 차트 */}
            {pbrBand && (
              <div className="card" style={{ flex: 2 }}>
                <div className="section-title">PBR 밴드</div>
                <PbrBandChart data={pbrBand} />
              </div>
            )}

            {/* 투자자별 매매동향 */}
            {investorFlow.length > 0 && (
              <div className="card" style={{ flex: 1, minWidth: 240 }}>
                <div className="section-title">투자자별 매매동향 (최근 60일)</div>
                <InvestorFlowChart data={investorFlow} />
              </div>
            )}
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          종목코드를 입력하고 조회 버튼을 눌러주세요.
        </div>
      )}
    </div>
  );
}

/* ── PBR 밴드 차트 ── */
function PbrBandChart({ data }: { data: any }) {
  const chartData = (data.dates || []).map((d: string, i: number) => ({
    date: d.slice(5),
    price: data.price?.[i],
    pbr1: data.pbr_1x?.[i],
    pbr15: data.pbr_15x?.[i],
    pbr2: data.pbr_2x?.[i],
    pbr25: data.pbr_25x?.[i],
  })).filter((_: any, i: number) => i % 5 === 0); // 5일 간격 샘플링

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(45,49,72,0.5)" />
        <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} interval={30} />
        <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} width={55}
          tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', fontSize: 11 }}
          formatter={(v: any) => v?.toLocaleString()}
        />
        <Legend wrapperStyle={{ fontSize: '0.68rem' }} />
        <Line type="monotone" dataKey="price" name="주가" stroke="#4a7cf7" strokeWidth={1.5} dot={false} />
        <Line type="monotone" dataKey="pbr25" name="2.5x" stroke="#e05252" strokeWidth={0.8} dot={false} strokeDasharray="4 2" />
        <Line type="monotone" dataKey="pbr2" name="2.0x" stroke="#f5a623" strokeWidth={0.8} dot={false} strokeDasharray="4 2" />
        <Line type="monotone" dataKey="pbr15" name="1.5x" stroke="#2ecc88" strokeWidth={0.8} dot={false} strokeDasharray="4 2" />
        <Line type="monotone" dataKey="pbr1" name="1.0x" stroke="#9098b1" strokeWidth={0.8} dot={false} strokeDasharray="4 2" />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ── 투자자별 매매동향 차트 ── */
function InvestorFlowChart({ data }: { data: any[] }) {
  const chartData = data.filter((_: any, i: number) => i % 3 === 0).map((d: any) => ({
    date: d.date?.slice(5),
    foreign: Math.round((d.foreign_net || 0) / 1e6),
    institution: Math.round((d.institution_net || 0) / 1e6),
    retail: Math.round((d.retail_net || 0) / 1e6),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(45,49,72,0.5)" />
        <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} interval={5} />
        <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} width={40}
          tickFormatter={v => `${v}M`} />
        <Tooltip
          contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', fontSize: 11 }}
          formatter={(v: any) => `${v}백만`}
        />
        <Legend wrapperStyle={{ fontSize: '0.68rem' }} />
        <Bar dataKey="foreign" name="외국인" fill="#4a7cf7" stackId="a" />
        <Bar dataKey="institution" name="기관" fill="#2ecc88" stackId="a" />
        <Bar dataKey="retail" name="개인" fill="#f5a623" stackId="a" />
      </BarChart>
    </ResponsiveContainer>
  );
}
