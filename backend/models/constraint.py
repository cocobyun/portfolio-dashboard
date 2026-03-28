from pydantic import BaseModel
from typing import Optional
from enum import Enum


class ConstraintStatus(str, Enum):
    NORMAL = "정상"
    WARNING = "경고"
    VIOLATION = "위반"
    MONITORING = "모니터링"


class ConstraintRule(BaseModel):
    name: str                           # 규칙명 (항목)
    stock_code: Optional[str] = None    # 해당 종목코드 (종목 규칙인 경우)
    stock_name: Optional[str] = None    # 해당 종목명

    current_value: Optional[float] = None   # 현재값
    expected_value: Optional[float] = None  # 증가예상값

    status: ConstraintStatus = ConstraintStatus.NORMAL
    violation_days: int = 0             # 위반일수
    sanction_exemption: bool = False    # 제재유예
    order_allowed: bool = True          # 주문허용

    warning_line: Optional[float] = None    # 경고라인
    violation_line: Optional[float] = None  # 위반라인
    tolerance: Optional[float] = None       # 허용 기준

    unit: str = "%"                     # 단위


class ConstraintSummary(BaseModel):
    net_exposure: Optional[ConstraintRule] = None
    above_1b_total: Optional[ConstraintRule] = None
    kosdaq_total: Optional[ConstraintRule] = None
    below_1b_individual: Optional[ConstraintRule] = None
    stock_investment: Optional[ConstraintRule] = None
    stock_individual: Optional[ConstraintRule] = None
    samsung_elec: Optional[ConstraintRule] = None
    hynix: Optional[ConstraintRule] = None
    lg_energy: Optional[ConstraintRule] = None
    benchmark_price: Optional[ConstraintRule] = None
    rules: list[ConstraintRule] = []
