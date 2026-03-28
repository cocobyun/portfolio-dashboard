'use client';
import { useEffect, useState, useCallback } from 'react';
import { fetchTargetView, calculateOrders } from '@/lib/api';
import { fmt, retClass } from '@/lib/format';
import ConstraintTable from '@/components/tables/ConstraintTable';
import HoldingsTable from '@/components/tables/HoldingsTable';

type TabKey = 'order' | 'analysis' | 'benchmark' | 'weightdiff' | 'periodorder' | 'approval' | 'score';

export default function TargetPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('order');
  const [colMode, setColMode] = useState<'basic' | 'scores' | 'orders'>('basic');
  const [showLong, setShowLong] = useState(true);

  const TABS: { key: TabKey; label: string }[] = [
    { key: 'order', label: '기간 주문' },
    { key: 'approval', label: '대여 승인' },
    { key: 'score', label: '5일기준가 & 표준편차' },
    { key: 'analysis', label: '회전율 차트' },
    { key: 'benchmark', label: '선물 계약수' },
    { key: 'weightdiff', label: '펀드별 한도' },
    { key: 'periodorder', label: '현금 소진율' },
  ];

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchTargetView();
      setData(res);
    } catch (e: any) {
      setError(e.message || '데이터 로딩 실패');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const summary = data?.summary;
  const constraints = data?.constraints || [];
  const longTarget = data?.long_target || [];
  const shortTarget = data?.short_target || [];
  const holdings = showLong ? longTarget : shortTarget;

  return (
    <div style={{ display: 'flex', gap: 14, height: '100%', minHeight: 0 }}>
      {/* 좌측 메인 패널 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>

        {/* 상단 KPI 요약 */}
        {summary && (
          <div className="card" style={{ padding: '10px 14px' }}>
            <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>총자산</span>
                <div style={{ fontSize: '1rem', fontWeight: 600, fontFamily: 'monospace' }}>
                  {fmt.trillion(summary.total_asset)}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>NAV</span>
                <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                  {summary.nav?.toFixed(2)}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>일간</span>
                <div className={`num ${retClass(summary.nav_change_rate)}`} style={{ fontSize: '1rem', fontWeight: 600 }}>
                  {fmt.ret(summary.nav_change_rate)}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>현금</span>
                <div style={{ fontSize: '1rem', fontWeight: 600 }}>{fmt.trillion(summary.cash)}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>주식비중</span>
                <div style={{ fontSize: '1rem', fontWeight: 600 }}>{fmt.pct(summary.stock_weight)}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>순익스포저</span>
                <div style={{ fontSize: '1rem', fontWeight: 600 }}>{fmt.pct(summary.net_exposure)}</div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary" onClick={load}>
                  ↻ 새로고침
                </button>
                <span style={{
                  padding: '4px 10px',
                  background: 'rgba(224,82,82,0.12)',
                  color: '#e05252',
                  borderRadius: 4,
                  fontSize: '0.72rem',
                  fontWeight: 600,
                }}>
                  주문 비활성화
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 제약 조건 테이블 */}
        <div className="card" style={{ padding: '10px 12px' }}>
          <div className="section-title">규제 / 한도 현황</div>
          {loading ? (
            <div style={{ color: 'var(--text-muted)', padding: 20, textAlign: 'center' }}>
              데이터 로딩 중...
            </div>
          ) : error ? (
            <div style={{ color: 'var(--accent-red)', padding: 10 }}>{error}</div>
          ) : (
            <ConstraintTable constraints={constraints} />
          )}
        </div>

        {/* 주문 입력 영역 (비활성화) */}
        <div className="card" style={{ padding: '10px 14px' }}>
          <div className="section-title">신규 주문</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <input type="text" placeholder="종목" style={{ width: 140 }} disabled />
            <select disabled style={{ width: 60 }}>
              <option>L ▼</option>
            </select>
            <input type="text" placeholder="주문(%)" style={{ width: 80 }} disabled />
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <input type="checkbox" disabled /> 전량 청산
            </label>
            <select disabled style={{ width: 70 }}>
              <option>CD</option>
            </select>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>시작T: 즉시</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>종료T: 15:10</span>
            <button className="btn btn-disabled" disabled title="조회 전용 모드 - 주문 비활성화">
              주문 입력
            </button>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              ※ 조회 전용 모드: 실제 주문 송신 불가
            </span>
          </div>
        </div>

        {/* 특수 주문 체크박스 */}
        <div className="card" style={{ padding: '8px 14px' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>특수 주문:</span>
            {['일괄 주문', '바스켓 주문', '기간 주문'].map(label => (
              <label key={label} style={{ display: 'flex', gap: 4, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <input type="checkbox" disabled /> {label}
              </label>
            ))}
          </div>
        </div>

        {/* Long / Short Target 테이블 */}
        <div className="card" style={{ padding: '10px 12px', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <button
              className={`btn ${showLong ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setShowLong(true)}
            >
              Long Target
            </button>
            <button
              className={`btn ${!showLong ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setShowLong(false)}
            >
              Short Target
            </button>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              <button className="btn btn-secondary" onClick={() => setColMode('basic')}>기본</button>
              <button className="btn btn-secondary" onClick={() => setColMode('scores')}>점수</button>
              <button className="btn btn-secondary" onClick={() => setColMode('orders')}>주문수량</button>
            </div>
            <button className="btn btn-secondary" style={{ fontSize: '0.72rem' }}>
              전체 주문 보기
            </button>
            <button className="btn btn-secondary" style={{ fontSize: '0.72rem' }}>
              전체 주문 닫기
            </button>
          </div>
          {loading ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>로딩 중...</div>
          ) : (
            <HoldingsTable
              holdings={holdings}
              showColumns={colMode}
              title={showLong ? 'Long' : 'Short'}
            />
          )}
        </div>
      </div>

      {/* 우측 탭 패널 */}
      <div
        style={{
          width: 280,
          minWidth: 280,
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}
      >
        <div
          className="card"
          style={{
            padding: 0,
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* 탭 헤더 */}
          <div
            style={{
              display: 'flex',
              overflowX: 'auto',
              borderBottom: '1px solid var(--bg-border)',
              flexShrink: 0,
            }}
          >
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  padding: '8px 10px',
                  fontSize: '0.7rem',
                  fontWeight: activeTab === key ? 600 : 400,
                  color: activeTab === key ? 'var(--accent-blue)' : 'var(--text-muted)',
                  borderBottom: activeTab === key ? '2px solid var(--accent-blue)' : '2px solid transparent',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 0,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 탭 본문 */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
            {activeTab === 'order' && <OrderTab longTarget={longTarget} />}
            {activeTab === 'score' && <ScoreTab holdings={longTarget} />}
            {activeTab !== 'order' && activeTab !== 'score' && (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 20, textAlign: 'center' }}>
                준비 중입니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────── 서브 컴포넌트 ────────────────────────── */

function OrderTab({ longTarget }: { longTarget: any[] }) {
  const cols = ['펀드', '종목', '종목명', 'LS', '비중(%)', '수량', 't0', 't1', '회차', '시작일', '종료일', '상태', '당일%', '누적%'];
  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        {['펀드', '종목', '종목명', 'LS', '비중(%)'].map(h => (
          <span key={h} style={{ fontSize: '0.65rem', color: 'var(--text-muted)', flex: 1 }}>{h}</span>
        ))}
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textAlign: 'center', marginTop: 20 }}>
        등록된 기간 주문 없음
      </div>
    </div>
  );
}

function ScoreTab({ holdings }: { holdings: any[] }) {
  return (
    <div>
      <div className="section-title">표준편차 & 점수</div>
      <table className="data-table" style={{ fontSize: '0.72rem' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>종목</th>
            <th>비중</th>
            <th>1d</th>
            <th>5d</th>
          </tr>
        </thead>
        <tbody>
          {holdings.slice(0, 15).map(h => (
            <tr key={h.code}>
              <td style={{ textAlign: 'left' }}>{h.name}</td>
              <td className="num">{fmt.pct(h.current_weight)}</td>
              <td className="num" style={{ color: 'var(--text-muted)' }}>-</td>
              <td className="num" style={{ color: 'var(--text-muted)' }}>-</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
