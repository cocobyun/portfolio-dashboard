from fastapi import APIRouter, Query, HTTPException
from ...adapters.research.financial_data import (
    search_stocks, get_financial_history, get_investor_flow, get_pbr_band
)
from ...models.research import PairData
import math
import random

router = APIRouter(prefix="/research", tags=["research"])


@router.get("/search")
def search_stock(q: str = Query(..., min_length=1)):
    """종목 검색"""
    results = search_stocks(q)
    return {"results": [r.model_dump() for r in results]}


@router.get("/financials/{code}")
def get_financials(code: str):
    """재무제표 조회 (분기 + 연간)"""
    records = get_financial_history(code)
    annual = [r.model_dump() for r in records if r.is_annual]
    quarterly = [r.model_dump() for r in records if not r.is_annual]
    return {"annual": annual, "quarterly": quarterly}


@router.get("/investor-flow/{code}")
def get_investor_flow_data(code: str, days: int = Query(60, ge=10, le=250)):
    """투자자별 매매동향"""
    data = get_investor_flow(code, days)
    return {"data": [d.model_dump() for d in data]}


@router.get("/pbr-band/{code}")
def get_pbr_band_data(code: str):
    """PBR 밴드 차트 데이터"""
    data = get_pbr_band(code)
    return data


@router.get("/pair")
def get_pair_data(
    code_a: str = Query(...),
    code_b: str = Query(...),
    days: int = Query(120, ge=20, le=365),
    window: int = Query(20, ge=5, le=60),
):
    """페어 전략 데이터 계산"""
    from datetime import date, timedelta
    today = date.today()

    dates = []
    price_a_list = []
    price_b_list = []

    base_a = {"A005930": 70000, "A000660": 280000}.get(code_a, 50000)
    base_b = {"A005930": 70000, "A000660": 280000}.get(code_b, 50000)

    d = today - timedelta(days=days + 30)
    pa, pb = float(base_a), float(base_b)
    while d <= today:
        if d.weekday() < 5:
            pa *= (1 + random.gauss(0.001, 0.015))
            pb *= (1 + random.gauss(0.001, 0.015))
            dates.append(d.isoformat())
            price_a_list.append(round(pa, 0))
            price_b_list.append(round(pb, 0))
        d += timedelta(days=1)

    # 스프레드 계산
    hedge_ratio = base_a / base_b
    spread = [pa - hedge_ratio * pb for pa, pb in zip(price_a_list, price_b_list)]

    # 롤링 통계
    result = []
    for i, (dt, pa, pb, sp) in enumerate(zip(dates, price_a_list, price_b_list, spread)):
        w_start = max(0, i - window + 1)
        window_spread = spread[w_start:i + 1]
        mean_sp = sum(window_spread) / len(window_spread)
        std_sp = (sum((x - mean_sp) ** 2 for x in window_spread) / len(window_spread)) ** 0.5 if len(window_spread) > 1 else 1

        w_corr_a = price_a_list[w_start:i + 1]
        w_corr_b = price_b_list[w_start:i + 1]
        n = len(w_corr_a)
        if n > 2:
            mean_a = sum(w_corr_a) / n
            mean_b = sum(w_corr_b) / n
            num = sum((a - mean_a) * (b - mean_b) for a, b in zip(w_corr_a, w_corr_b))
            std_a = (sum((a - mean_a) ** 2 for a in w_corr_a) / n) ** 0.5
            std_b = (sum((b - mean_b) ** 2 for b in w_corr_b) / n) ** 0.5
            corr = num / (n * std_a * std_b) if std_a * std_b > 0 else 0
        else:
            corr = 0

        result.append(PairData(
            date=dt,
            price_a=pa,
            price_b=pb,
            spread=round(sp, 2),
            spread_mean=round(mean_sp, 2),
            spread_upper=round(mean_sp + 2 * std_sp, 2),
            spread_lower=round(mean_sp - 2 * std_sp, 2),
            hedge_ratio=round(hedge_ratio, 4),
            correlation=round(corr, 4),
        ))

    return {"data": [r.model_dump() for r in result], "code_a": code_a, "code_b": code_b}
