/** 숫자 포맷 유틸리티 */

export const fmt = {
  /** 가격 (소수점 없이, 천단위 구분) */
  price: (v?: number | null) => {
    if (v == null) return '-';
    return v.toLocaleString('ko-KR', { maximumFractionDigits: 0 });
  },

  /** 비중 (소수점 2자리 + %) */
  pct: (v?: number | null, digits = 2) => {
    if (v == null) return '-';
    return `${v.toFixed(digits)}%`;
  },

  /** 수익률 (+/- 부호 포함) */
  ret: (v?: number | null) => {
    if (v == null) return '-';
    const sign = v > 0 ? '+' : '';
    return `${sign}${v.toFixed(2)}%`;
  },

  /** 금액 (억 단위) */
  billion: (v?: number | null) => {
    if (v == null) return '-';
    return `${(v / 1e8).toFixed(1)}억`;
  },

  /** 금액 (조 단위) */
  trillion: (v?: number | null) => {
    if (v == null) return '-';
    if (Math.abs(v) >= 1e12) return `${(v / 1e12).toFixed(2)}조`;
    if (Math.abs(v) >= 1e8) return `${(v / 1e8).toFixed(0)}억`;
    return v.toLocaleString('ko-KR');
  },

  /** 수량 (정수) */
  qty: (v?: number | null) => {
    if (v == null) return '-';
    return v.toLocaleString('ko-KR');
  },

  /** 날짜 YYYY-MM-DD → MM/DD */
  shortDate: (s?: string) => {
    if (!s) return '';
    return s.slice(5);
  },
};

/** 수익률에 따른 색상 클래스 (한국식: 상승=빨강) */
export const retClass = (v?: number | null) => {
  if (v == null) return '';
  if (v > 0) return 'pos';
  if (v < 0) return 'neg';
  return '';
};
