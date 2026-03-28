import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

export const metadata: Metadata = {
  title: 'Trading Operations Platform',
  description: '포트폴리오 운용, 주문 보조, 리서치, 모니터링 통합 플랫폼',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
          <Sidebar />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <TopBar />
            <main
              style={{
                flex: 1,
                overflow: 'auto',
                padding: '16px',
                backgroundColor: 'var(--bg-primary)',
              }}
            >
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
