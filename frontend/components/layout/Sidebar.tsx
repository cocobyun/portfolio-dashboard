'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MENU = [
  {
    group: 'FRONT',
    items: [
      { href: '/target', label: 'Target', icon: '⊞' },
      { href: '/analysis', label: 'Portfolio Analysis', icon: '◈' },
    ],
  },
  {
    group: 'RESEARCH',
    items: [
      { href: '/research', label: '국내주식', icon: '◉' },
      { href: '/pair', label: 'Pair Strategy', icon: '⇄' },
    ],
  },
  {
    group: 'TOOLS',
    items: [
      { href: '/settings', label: '설정', icon: '⚙' },
    ],
  },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside
      style={{
        width: 200,
        minWidth: 200,
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--bg-border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* 로고 */}
      <div
        style={{
          padding: '16px 16px 12px',
          borderBottom: '1px solid var(--bg-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 18, color: 'var(--accent-blue)' }}>⬡</span>
        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
          TMS
        </span>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: '0.6rem',
            background: 'rgba(46,204,136,0.15)',
            color: '#2ecc88',
            padding: '2px 5px',
            borderRadius: 3,
            fontWeight: 600,
          }}
        >
          LIVE
        </span>
      </div>

      {/* 메뉴 */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {MENU.map(({ group, items }) => (
          <div key={group}>
            <div
              style={{
                padding: '10px 14px 4px',
                fontSize: '0.65rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                letterSpacing: '0.08em',
              }}
            >
              {group}
            </div>
            {items.map(({ href, label, icon }) => {
              const active = path === href || path.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '7px 14px',
                    fontSize: '0.82rem',
                    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                    backgroundColor: active ? 'var(--bg-hover)' : 'transparent',
                    borderLeft: active ? '2px solid var(--accent-blue)' : '2px solid transparent',
                    textDecoration: 'none',
                    transition: 'all 0.1s',
                  }}
                >
                  <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>{icon}</span>
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* 하단 정보 */}
      <div
        style={{
          padding: '10px 14px',
          borderTop: '1px solid var(--bg-border)',
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ marginBottom: 2 }}>조회 전용 모드</div>
        <div style={{ color: 'var(--accent-yellow)', fontSize: '0.65rem' }}>
          ⚠ 실계좌 | 주문 비활성화
        </div>
      </div>
    </aside>
  );
}
