import axios from 'axios';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: BASE,
  timeout: 15000,
});

// 기본 파라미터: 목 데이터 사용
const DEFAULT_PARAMS = { use_mock: true };

// ── 계좌 ──────────────────────────────────────────
export const fetchHoldings = () =>
  api.get('/account/holdings', { params: DEFAULT_PARAMS }).then(r => r.data);

export const fetchConstraints = () =>
  api.get('/account/constraints', { params: DEFAULT_PARAMS }).then(r => r.data);

// ── 타겟 ──────────────────────────────────────────
export const fetchTargetView = () =>
  api.get('/target/', { params: DEFAULT_PARAMS }).then(r => r.data);

export const uploadTargets = (targets: TargetItem[]) =>
  api.post('/target/upload', targets).then(r => r.data);

export const calculateOrders = () =>
  api.get('/target/order-calc', { params: DEFAULT_PARAMS }).then(r => r.data);

// ── 포트폴리오 ────────────────────────────────────
export const fetchPortfolioAnalysis = (days = 90) =>
  api.get('/portfolio/analysis', { params: { ...DEFAULT_PARAMS, days } }).then(r => r.data);

export const fetchPerformance = (days = 90) =>
  api.get('/portfolio/performance', { params: { days } }).then(r => r.data);

export const fetchSectorBreakdown = () =>
  api.get('/portfolio/sector', { params: DEFAULT_PARAMS }).then(r => r.data);

// ── 리서치 ────────────────────────────────────────
export const searchStock = (q: string) =>
  api.get('/research/search', { params: { q } }).then(r => r.data);

export const fetchFinancials = (code: string) =>
  api.get(`/research/financials/${code}`).then(r => r.data);

export const fetchInvestorFlow = (code: string, days = 60) =>
  api.get(`/research/investor-flow/${code}`, { params: { days } }).then(r => r.data);

export const fetchPbrBand = (code: string) =>
  api.get(`/research/pbr-band/${code}`).then(r => r.data);

export const fetchPairData = (codeA: string, codeB: string, days = 120, window = 20) =>
  api.get('/research/pair', { params: { code_a: codeA, code_b: codeB, days, window } }).then(r => r.data);

// ── 타입 ──────────────────────────────────────────
export interface TargetItem {
  code: string;
  name?: string;
  target_weight: number;
  ls: 'L' | 'S';
  group?: string;
}
