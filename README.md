# Trading Operations Platform

포트폴리오 운용, 주문 보조, 리서치, 모니터링을 통합한 웹 기반 운용 시스템.
키움증권 REST API (실계좌) 기반 · 조회 전용 모드 기본값 · 실계좌 보호 설계.

---

## 시스템 구조

```
portfolio-dashboard/
├── backend/                    # FastAPI 백엔드
│   ├── main.py                 # 앱 진입점, CORS, 라우터 등록
│   ├── config.py               # 환경변수 설정 (pydantic-settings)
│   ├── api/routes/             # API 엔드포인트
│   │   ├── account.py          # 계좌/잔고 조회
│   │   ├── target.py           # 타겟/주문 보조
│   │   ├── portfolio.py        # 포트폴리오 분석
│   │   └── research.py         # 종목 리서치, 페어 전략
│   ├── services/               # 비즈니스 로직
│   │   ├── account_service.py
│   │   ├── target_service.py
│   │   └── portfolio_service.py
│   ├── adapters/               # 외부 데이터 소스 어댑터
│   │   ├── kiwoom/
│   │   │   ├── client.py       # 키움 REST API 클라이언트
│   │   │   ├── token_manager.py # OAuth2 토큰 캐싱
│   │   │   └── mock_data.py    # 개발용 목 데이터
│   │   └── research/
│   │       └── financial_data.py # 재무/리서치 데이터 (확장 가능)
│   └── models/                 # Pydantic 데이터 모델
│       ├── holding.py
│       ├── account.py
│       ├── constraint.py
│       └── research.py
└── frontend/                   # Next.js 프론트엔드
    ├── app/
    │   ├── layout.tsx           # 사이드바 + 탑바 레이아웃
    │   ├── target/page.tsx      # 타겟 화면 (MVP)
    │   ├── analysis/page.tsx    # 포트폴리오 분석
    │   ├── research/page.tsx    # 종목 리서치
    │   ├── pair/page.tsx        # 페어 전략
    │   └── settings/page.tsx    # API 설정
    ├── components/
    │   ├── layout/              # Sidebar, TopBar
    │   ├── tables/              # ConstraintTable, HoldingsTable
    │   ├── charts/              # PerformanceChart, SectorChart
    │   └── cards/               # KpiCard
    └── lib/
        ├── api.ts               # axios API 클라이언트
        └── format.ts            # 숫자/날짜 포맷 유틸
```

---

## 화면 구성

| 경로 | 화면 | 주요 기능 |
|------|------|-----------|
| `/target` | **Target** | 규제/한도 현황, Long/Short 타겟 테이블, 주문 입력 영역 (비활성) |
| `/analysis` | **Portfolio Analysis** | KPI 카드, 일별 성과 차트, 섹터 비중, 종목별 기여도 |
| `/research` | **국내주식 리서치** | 재무제표 테이블, PBR 밴드, 투자자별 매매동향 |
| `/pair` | **Pair Strategy** | 가격 비교, 스프레드, 헤지 비율, 상관관계 차트 |
| `/settings` | **설정** | API 키 설정, 보안 모드 확인 |

---

## 실행 방법

### 1. 환경 설정

```bash
cp .env.example .env
# .env 파일에 키움 API 키와 계좌번호 입력
```

### 2. 백엔드 실행

```bash
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
# API 문서: http://localhost:8000/docs
```

### 3. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
# http://localhost:3000
```

---

## 데이터 소스 구조

| 데이터 | 소스 | 비고 |
|--------|------|------|
| 계좌 잔고, 보유 종목 | 키움 `kt00018` | 실계좌 |
| 예수금 | 키움 `kt00001` | 실계좌 |
| 현재가 | 키움 `kt10001` | 실계좌 |
| 재무제표 | 확장 예정 | FinanceDataReader / KRX |
| 투자자 동향 | 확장 예정 | KRX / 증권사 API |
| 타겟 비중 | 내부 저장소 | CSV 업로드 / 직접 입력 |
| 제약 조건 룰 | 내부 설정 | 추후 DB 연동 |

---

## 보안 원칙

- **실계좌 보호**: `READ_ONLY_MODE=true` 기본값 → 주문 API 비활성화
- **주문 차단**: `ORDER_ENABLED=false`로 고정 (명시적 플래그 없이 동작 불가)
- **민감정보 격리**: appkey, secretkey, 계좌번호는 백엔드(.env)에서만 관리
- **프론트 비노출**: API 키는 프론트엔드에 전달되지 않음
- **계좌번호 보호**: API 응답에 계좌번호 전체 노출 금지

---

## 구현 로드맵

### Phase 1 (완료)
- [x] 백엔드 아키텍처 (FastAPI + 어댑터 패턴)
- [x] 키움 API 클라이언트 + 토큰 관리
- [x] 목 데이터 기반 전체 화면 동작
- [x] Target 화면 (제약 조건, Long 타겟 테이블)
- [x] Portfolio Analysis 화면 (성과 차트, 섹터, 기여도)
- [x] Research 화면 (재무제표, PBR 밴드, 투자자 동향)
- [x] Pair Strategy 화면 (스프레드, 헤지 비율, 상관관계)

### Phase 2 (예정)
- [ ] 키움 실계좌 연동 (실 API 데이터)
- [ ] 타겟 비중 CSV 업로드
- [ ] 제약 조건 DB 저장/편집
- [ ] 주문 필요 수량 고급 계산 (거래량 제한 등)

### Phase 3 (예정)
- [ ] 재무데이터 외부 소스 연동
- [ ] 전략 점수 시스템
- [ ] 성과 리포트 저장/출력
- [ ] 사용자/펀드별 권한 관리

---

## 기술 스택

| 계층 | 기술 |
|------|------|
| 백엔드 | Python 3.11+, FastAPI, Pydantic v2, uvicorn |
| 프론트엔드 | Next.js 14, React 18, TypeScript, Tailwind CSS |
| 차트 | Recharts |
| API 통신 | axios |
| 데이터 소스 | 키움증권 REST API |
