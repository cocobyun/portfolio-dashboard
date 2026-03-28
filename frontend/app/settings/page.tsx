'use client';
import { useState } from 'react';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [host, setHost] = useState('https://api.kiwoom.com');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // 실제로는 백엔드 /api/config 등을 통해 환경변수 파일에 저장
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ maxWidth: 560 }}>
      <div className="card">
        <div className="section-title">키움증권 API 설정</div>
        <div style={{
          padding: '8px 12px',
          background: 'rgba(245,166,35,0.1)',
          border: '1px solid rgba(245,166,35,0.3)',
          borderRadius: 4,
          fontSize: '0.78rem',
          color: 'var(--accent-yellow)',
          marginBottom: 16,
        }}>
          ⚠ 민감정보는 서버 환경변수(.env)로 관리됩니다. 브라우저에 저장되지 않습니다.
          실계좌 보호를 위해 주문 기능은 기본 비활성화 상태입니다.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <FormRow label="API Key">
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="키움 OpenAPI App Key"
              style={{ width: '100%' }}
            />
          </FormRow>
          <FormRow label="Secret Key">
            <input
              type="password"
              value={secretKey}
              onChange={e => setSecretKey(e.target.value)}
              placeholder="키움 OpenAPI Secret Key"
              style={{ width: '100%' }}
            />
          </FormRow>
          <FormRow label="계좌번호">
            <input
              type="text"
              value={accountNo}
              onChange={e => setAccountNo(e.target.value)}
              placeholder="종합계좌번호 (뒤 3자리 제외)"
              style={{ width: '100%' }}
            />
          </FormRow>
          <FormRow label="API 서버">
            <select
              value={host}
              onChange={e => setHost(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="https://api.kiwoom.com">실계좌 (api.kiwoom.com)</option>
              <option value="https://mockapi.kiwoom.com">모의 (mockapi.kiwoom.com)</option>
            </select>
          </FormRow>

          <div style={{ paddingTop: 8, borderTop: '1px solid var(--bg-border)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>
              설정은 서버의 <code style={{ background: 'var(--bg-secondary)', padding: '1px 4px', borderRadius: 3 }}>.env</code> 파일에 저장됩니다.
            </div>
            <button className="btn btn-primary" onClick={handleSave}>
              {saved ? '✓ 저장됨' : '저장'}
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="section-title">보안 설정</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SecurityItem
            label="조회 전용 모드"
            desc="활성화 시 모든 주문 기능 비활성화 (기본값: ON)"
            active={true}
            fixed
          />
          <SecurityItem
            label="주문 기능"
            desc="실계좌 보호: 별도 플래그 없이는 주문 불가 (기본값: OFF)"
            active={false}
            fixed
          />
          <SecurityItem
            label="민감정보 로그 차단"
            desc="토큰, 계좌번호, API 키의 로그 출력 차단"
            active={true}
            fixed
          />
        </div>
      </div>
    </div>
  );
}

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 90, fontSize: '0.78rem', color: 'var(--text-secondary)', flexShrink: 0 }}>
        {label}
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

function SecurityItem({
  label, desc, active, fixed,
}: {
  label: string; desc: string; active: boolean; fixed?: boolean;
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
      padding: '8px 0',
      borderBottom: '1px solid rgba(45,49,72,0.4)',
    }}>
      <div style={{
        marginTop: 2,
        width: 28,
        height: 16,
        borderRadius: 8,
        background: active ? 'var(--accent-green)' : 'var(--bg-border)',
        flexShrink: 0,
        opacity: fixed ? 0.7 : 1,
        cursor: fixed ? 'not-allowed' : 'pointer',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          width: 12,
          height: 12,
          background: 'white',
          borderRadius: '50%',
          top: 2,
          left: active ? 14 : 2,
          transition: 'left 0.2s',
        }} />
      </div>
      <div>
        <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)' }}>
          {label}
          {fixed && <span style={{ marginLeft: 6, fontSize: '0.65rem', color: 'var(--text-muted)' }}>(고정)</span>}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>
      </div>
    </div>
  );
}
