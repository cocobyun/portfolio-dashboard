from pydantic import BaseModel
from typing import Optional
from enum import Enum


class LongShort(str, Enum):
    LONG = "L"
    SHORT = "S"


class HoldingModel(BaseModel):
    code: str                      # 종목코드
    name: str                      # 종목명
    market: Optional[str] = None   # 시장 (KOSPI / KOSDAQ)
    sector: Optional[str] = None   # 섹터
    group: Optional[str] = None    # 그룹
    ls: LongShort = LongShort.LONG # 롱/숏 구분

    qty: int = 0                   # 보유수량
    avg_price: float = 0.0         # 평균단가
    current_price: float = 0.0     # 현재가
    eval_amount: float = 0.0       # 평가금액
    eval_profit: float = 0.0       # 평가손익
    profit_rate: float = 0.0       # 수익률 (%)

    current_weight: float = 0.0    # 현재 비중 (%)
    target_weight: float = 0.0     # 목표 비중 (%)
    weight_diff: float = 0.0       # 비중 차이 (%)

    order_qty: int = 0             # 주문 필요 수량
    order_amount: float = 0.0      # 주문 필요 금액
    filled_qty: int = 0            # 체결량
    filled_price: float = 0.0      # 체결가
    order_status: Optional[str] = None  # 주문상태

    # 표준편차 점수
    std_score_1d: Optional[float] = None
    std_score_5d: Optional[float] = None
    std_score_12fw: Optional[float] = None
    price_score: Optional[float] = None
    quant_score: Optional[float] = None

    # 추정치 변경
    estimate_change_prev: Optional[float] = None
    estimate_change_5d: Optional[float] = None

    sz: Optional[str] = None       # Size (L/M/S)
    sec: Optional[str] = None      # Sector code


class TargetUploadItem(BaseModel):
    code: str
    name: Optional[str] = None
    target_weight: float
    ls: LongShort = LongShort.LONG
    group: Optional[str] = None
