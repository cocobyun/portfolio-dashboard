"""
리서치 데이터 어댑터 (목 데이터 포함)
실제 운용 시 증권사 API / FinanceDataReader / KRX 데이터 등으로 교체
"""
import random
from ...models.research import FinancialRecord, StockInfo, InvestorFlow


STOCK_DB = {
    "A005930": StockInfo(code="A005930", name="삼성전자", market="KOSPI",
                         sector="반도체", fiscal_month=12,
                         current_price=71500, market_cap=427000000000000),
    "A000660": StockInfo(code="A000660", name="SK하이닉스", market="KOSPI",
                         sector="반도체", fiscal_month=12,
                         current_price=288000, market_cap=209000000000000),
    "A005380": StockInfo(code="A005380", name="현대차", market="KOSPI",
                         sector="자동차", fiscal_month=12,
                         current_price=219000, market_cap=46000000000000),
}


def search_stocks(query: str) -> list[StockInfo]:
    results = []
    q = query.lower()
    for info in STOCK_DB.values():
        if q in info.name.lower() or q in info.code.lower():
            results.append(info)
    return results


def get_financial_history(code: str) -> list[FinancialRecord]:
    """분기별/연간 재무 데이터 (목 데이터)"""
    records = []
    base_rev = {"A005930": 700000, "A000660": 400000, "A005380": 160000}.get(code, 100000)

    # 연간 데이터 (최근 5개년)
    for year in range(2019, 2024):
        rev = base_rev * (1 + (year - 2019) * 0.08 + random.gauss(0, 0.03))
        op = rev * random.uniform(0.12, 0.22)
        net = op * random.uniform(0.75, 0.90)
        records.append(FinancialRecord(
            period=f"{year}A",
            is_annual=True,
            revenue=round(rev, 0),
            revenue_growth=round(random.uniform(-5, 20), 1),
            op_profit=round(op, 0),
            op_margin=round(op / rev * 100, 1),
            net_profit=round(net, 0),
            roe=round(random.uniform(8, 20), 1),
            per=round(random.uniform(8, 20), 1),
            pbr=round(random.uniform(0.8, 2.5), 2),
            dps=round(random.randint(500, 2000), -2),
        ))

    # 분기 데이터 (최근 8분기)
    quarters = ["2022Q3", "2022Q4", "2023Q1", "2023Q2",
                "2023Q3", "2023Q4", "2024Q1", "2024Q2"]
    for q in quarters:
        rev = base_rev / 4 * random.uniform(0.7, 1.3)
        op = rev * random.uniform(0.05, 0.25)
        net = op * random.uniform(0.6, 0.95)
        records.append(FinancialRecord(
            period=q,
            is_annual=False,
            revenue=round(rev, 0),
            revenue_growth=round(random.uniform(-15, 30), 1),
            op_profit=round(op, 0),
            op_margin=round(op / rev * 100, 1) if rev else 0,
            net_profit=round(net, 0),
            roe=round(random.uniform(3, 20), 1),
            per=round(random.uniform(8, 25), 1),
            pbr=round(random.uniform(0.8, 2.5), 2),
        ))

    return records


def get_investor_flow(code: str, days: int = 60) -> list[InvestorFlow]:
    from datetime import date, timedelta
    records = []
    today = date.today()
    for i in range(days, 0, -1):
        d = today - timedelta(days=i)
        if d.weekday() >= 5:
            continue
        scale = 1_000_000
        records.append(InvestorFlow(
            date=d.isoformat(),
            foreign_net=round(random.gauss(0, 5) * scale, 0),
            institution_net=round(random.gauss(0, 3) * scale, 0),
            retail_net=round(random.gauss(0, 8) * scale, 0),
            program_net=round(random.gauss(0, 2) * scale, 0),
        ))
    return records


def get_pbr_band(code: str) -> dict:
    """PBR 밴드 데이터 (목 데이터)"""
    from datetime import date, timedelta
    today = date.today()
    dates = []
    bps_history = []
    price_history = []
    d = today - timedelta(days=365 * 3)
    bps = {"A005930": 42000, "A000660": 150000, "A005380": 180000}.get(code, 50000)

    while d <= today:
        if d.weekday() < 5:
            dates.append(d.isoformat())
            bps = bps * (1 + random.gauss(0.001, 0.005))
            price = bps * random.uniform(1.0, 2.2)
            bps_history.append(round(bps, 0))
            price_history.append(round(price, 0))
        d += timedelta(days=1)

    return {
        "dates": dates,
        "price": price_history,
        "bps": bps_history,
        "pbr_1x": bps_history,
        "pbr_15x": [b * 1.5 for b in bps_history],
        "pbr_2x": [b * 2.0 for b in bps_history],
        "pbr_25x": [b * 2.5 for b in bps_history],
    }
