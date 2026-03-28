from pydantic import BaseModel
from typing import Optional, List


class FinancialRecord(BaseModel):
    period: str          # 기간 (2023Q1, 2023A 등)
    is_annual: bool      # 연간 여부

    revenue: Optional[float] = None          # 매출
    revenue_growth: Optional[float] = None   # 매출 성장률 (%)
    op_profit: Optional[float] = None        # 영업이익
    op_margin: Optional[float] = None        # 영업이익률 (%)
    net_profit: Optional[float] = None       # 순이익

    market_cap: Optional[float] = None       # 시가총액
    total_assets: Optional[float] = None     # 자산
    total_debt: Optional[float] = None       # 부채
    total_equity: Optional[float] = None     # 자본

    roe: Optional[float] = None              # ROE (%)
    per: Optional[float] = None              # PER
    pbr: Optional[float] = None              # PBR
    dps: Optional[float] = None              # DPS (원)
    eps: Optional[float] = None              # EPS


class StockInfo(BaseModel):
    code: str
    name: str
    market: Optional[str] = None
    sector: Optional[str] = None
    current_price: Optional[float] = None
    market_cap: Optional[float] = None
    fiscal_month: Optional[int] = None      # 결산월


class InvestorFlow(BaseModel):
    date: str
    foreign_net: Optional[float] = None     # 외국인 순매수
    institution_net: Optional[float] = None # 기관 순매수
    retail_net: Optional[float] = None      # 개인 순매수
    program_net: Optional[float] = None     # 프로그램 순매수


class PairData(BaseModel):
    date: str
    price_a: float
    price_b: float
    spread: Optional[float] = None
    spread_mean: Optional[float] = None
    spread_upper: Optional[float] = None
    spread_lower: Optional[float] = None
    hedge_ratio: Optional[float] = None
    correlation: Optional[float] = None
