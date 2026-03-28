from pydantic import BaseModel
from typing import Optional
from datetime import date


class AccountSummary(BaseModel):
    date: Optional[str] = None
    fund_name: Optional[str] = None
    strategy: Optional[str] = None

    total_asset: float = 0.0          # 총자산
    cash: float = 0.0                  # 현금 (예수금)
    stock_eval: float = 0.0           # 주식 평가금액
    total_profit: float = 0.0         # 총 평가손익
    total_profit_rate: float = 0.0    # 총 수익률 (%)

    nav: float = 0.0                   # NAV
    nav_change: float = 0.0            # 일간 NAV 변화
    nav_change_rate: float = 0.0       # 일간 수익률 (%)
    cost: float = 0.0                  # 비용

    cash_weight: float = 0.0           # 현금 비중 (%)
    stock_weight: float = 0.0          # 주식 비중 (%)
    long_weight: float = 0.0           # 롱 비중 (%)
    short_weight: float = 0.0          # 숏 비중 (%)
    net_exposure: float = 0.0          # 순익스포저 (%)
    long_exposure: float = 0.0         # 롱 익스포저 (%)
    short_exposure: float = 0.0        # 숏 익스포저 (%)

    kospi_weight: float = 0.0          # KOSPI 비중
    kosdaq_weight: float = 0.0         # KOSDAQ 비중

    pbr: Optional[float] = None        # 포트폴리오 PBR


class DailyPerformance(BaseModel):
    date: str
    nav: float
    daily_return: float
    cumulative_return: float
    benchmark_return: Optional[float] = None
    benchmark_cumul: Optional[float] = None
