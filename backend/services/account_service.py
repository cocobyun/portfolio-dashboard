"""
계좌/잔고 서비스
키움 API 데이터를 내부 모델로 변환
"""
import logging
from typing import Optional
from ..adapters.kiwoom.client import KiwoomClient
from ..adapters.kiwoom.mock_data import (
    MOCK_HOLDINGS, MOCK_SUMMARY, MOCK_DEPOSIT,
    SECTOR_MAP, TARGET_WEIGHTS, MOCK_CONSTRAINTS
)
from ..models.holding import HoldingModel, LongShort
from ..models.account import AccountSummary
from ..models.constraint import ConstraintRule, ConstraintStatus

logger = logging.getLogger(__name__)


def _parse_float(val) -> float:
    if val is None:
        return 0.0
    try:
        return float(str(val).replace(",", ""))
    except (ValueError, TypeError):
        return 0.0


class AccountService:
    def __init__(self, client: Optional[KiwoomClient] = None, use_mock: bool = False):
        self._client = client
        self._use_mock = use_mock or client is None

    # ─────────────────────────────────────────────────────
    # 보유 종목 조회
    # ─────────────────────────────────────────────────────

    def get_holdings(self) -> tuple[AccountSummary, list[HoldingModel]]:
        if self._use_mock:
            return self._parse_mock()
        raw = self._client.get_account_balance()
        return self._parse_api(raw)

    def _parse_mock(self) -> tuple[AccountSummary, list[HoldingModel]]:
        deposit_amt = _parse_float(MOCK_DEPOSIT.get("dnca_tot_amt"))
        total_stock_eval = sum(
            _parse_float(h["cur_prc"]) * _parse_float(h["rmnd_qty"])
            for h in MOCK_HOLDINGS
        )
        total_asset = total_stock_eval + deposit_amt

        summary = AccountSummary(
            total_asset=total_asset,
            cash=deposit_amt,
            stock_eval=total_stock_eval,
            total_profit=_parse_float(MOCK_SUMMARY["tot_evlt_pl"]),
            total_profit_rate=_parse_float(MOCK_SUMMARY["tot_prft_rt"]),
            nav=1036.38,
            nav_change=2.15,
            nav_change_rate=0.21,
            cost=320000,
            cash_weight=round(deposit_amt / total_asset * 100, 2) if total_asset else 0,
            stock_weight=round(total_stock_eval / total_asset * 100, 2) if total_asset else 0,
            long_weight=round(total_stock_eval / total_asset * 100, 2) if total_asset else 0,
            short_weight=0.0,
            net_exposure=round(total_stock_eval / total_asset * 100, 2) if total_asset else 0,
            long_exposure=round(total_stock_eval / total_asset * 100, 2) if total_asset else 0,
            short_exposure=0.0,
            kosdaq_weight=round(
                sum(_parse_float(h["cur_prc"]) * _parse_float(h["rmnd_qty"])
                    for h in MOCK_HOLDINGS
                    if SECTOR_MAP.get(h["stk_cd"], {}).get("market") == "KOSDAQ")
                / total_asset * 100, 2) if total_asset else 0,
        )

        holdings = []
        for h in MOCK_HOLDINGS:
            code = h["stk_cd"]
            cur_prc = _parse_float(h["cur_prc"])
            qty = int(_parse_float(h["rmnd_qty"]))
            eval_amt = cur_prc * qty
            weight = round(eval_amt / total_asset * 100, 2) if total_asset else 0
            target_w = TARGET_WEIGHTS.get(code, 0.0)
            sec_info = SECTOR_MAP.get(code, {})

            holdings.append(HoldingModel(
                code=code,
                name=h["stk_nm"],
                market=sec_info.get("market"),
                sector=sec_info.get("sector"),
                group=sec_info.get("group"),
                ls=LongShort.LONG,
                qty=qty,
                avg_price=_parse_float(h["pur_pric"]),
                current_price=cur_prc,
                eval_amount=eval_amt,
                eval_profit=_parse_float(h["evltv_prft"]),
                profit_rate=_parse_float(h["prft_rt"]),
                current_weight=weight,
                target_weight=target_w,
                weight_diff=round(target_w - weight, 2),
                sz=sec_info.get("sz"),
                sec=sec_info.get("sec"),
            ))

        return summary, holdings

    def _parse_api(self, raw: dict) -> tuple[AccountSummary, list[HoldingModel]]:
        s = raw.get("summary", {})
        raw_deposit = self._client.get_deposit()
        deposit_amt = _parse_float(raw_deposit.get("dnca_tot_amt", 0))

        total_stock_eval = _parse_float(s.get("tot_evlt_amt", 0))
        total_asset = total_stock_eval + deposit_amt

        summary = AccountSummary(
            total_asset=total_asset,
            cash=deposit_amt,
            stock_eval=total_stock_eval,
            total_profit=_parse_float(s.get("tot_evlt_pl", 0)),
            total_profit_rate=_parse_float(s.get("tot_prft_rt", 0)),
            nav=0,
            cash_weight=round(deposit_amt / total_asset * 100, 2) if total_asset else 0,
            stock_weight=round(total_stock_eval / total_asset * 100, 2) if total_asset else 0,
            long_weight=round(total_stock_eval / total_asset * 100, 2) if total_asset else 0,
            net_exposure=round(total_stock_eval / total_asset * 100, 2) if total_asset else 0,
            long_exposure=round(total_stock_eval / total_asset * 100, 2) if total_asset else 0,
        )

        holdings = []
        for h in raw.get("holdings", []):
            code = h.get("stk_cd", "")
            cur_prc = _parse_float(h.get("cur_prc", 0))
            qty = int(_parse_float(h.get("rmnd_qty", 0)))
            eval_amt = cur_prc * qty
            weight = round(eval_amt / total_asset * 100, 2) if total_asset else 0
            sec_info = SECTOR_MAP.get(code, {})

            holdings.append(HoldingModel(
                code=code,
                name=h.get("stk_nm", ""),
                market=sec_info.get("market"),
                sector=sec_info.get("sector"),
                group=sec_info.get("group"),
                ls=LongShort.LONG,
                qty=qty,
                avg_price=_parse_float(h.get("pur_pric", 0)),
                current_price=cur_prc,
                eval_amount=eval_amt,
                eval_profit=_parse_float(h.get("evltv_prft", 0)),
                profit_rate=_parse_float(h.get("prft_rt", 0)),
                current_weight=weight,
                sz=sec_info.get("sz"),
                sec=sec_info.get("sec"),
            ))

        return summary, holdings

    # ─────────────────────────────────────────────────────
    # 제약 조건 조회
    # ─────────────────────────────────────────────────────

    def get_constraints(self) -> list[ConstraintRule]:
        rules = []
        for c in MOCK_CONSTRAINTS:
            status_map = {
                "정상": ConstraintStatus.NORMAL,
                "경고": ConstraintStatus.WARNING,
                "위반": ConstraintStatus.VIOLATION,
                "모니터링": ConstraintStatus.MONITORING,
            }
            rules.append(ConstraintRule(
                name=c["name"],
                stock_code=c.get("stock_code"),
                stock_name=c.get("stock_name"),
                current_value=c.get("current_value"),
                expected_value=c.get("expected_value"),
                status=status_map.get(c.get("status", "정상"), ConstraintStatus.NORMAL),
                violation_days=c.get("violation_days", 0),
                sanction_exemption=c.get("sanction_exemption", False),
                order_allowed=c.get("order_allowed", True),
                warning_line=c.get("warning_line"),
                violation_line=c.get("violation_line"),
                tolerance=c.get("tolerance"),
            ))
        return rules
