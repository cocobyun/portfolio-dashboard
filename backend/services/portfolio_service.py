"""
포트폴리오 분석 서비스
성과 지표, 섹터 분석, 기여도 계산
"""
from ..adapters.kiwoom.mock_data import get_mock_performance, MOCK_HOLDINGS, SECTOR_MAP
from ..models.account import DailyPerformance, AccountSummary


class PortfolioService:
    def get_performance(self, days: int = 90) -> list[DailyPerformance]:
        raw = get_mock_performance(days)
        return [DailyPerformance(**r) for r in raw]

    def get_sector_breakdown(self, holdings: list, total_asset: float) -> list[dict]:
        sector_map: dict[str, float] = {}
        for h in holdings:
            if hasattr(h, "sector") and h.sector:
                sector_map[h.sector] = sector_map.get(h.sector, 0) + h.eval_amount
            elif isinstance(h, dict):
                sec = h.get("sector") or SECTOR_MAP.get(h.get("code", ""), {}).get("sector", "기타")
                amt = h.get("eval_amount", 0)
                sector_map[sec] = sector_map.get(sec, 0) + amt

        result = []
        for sector, amt in sorted(sector_map.items(), key=lambda x: x[1], reverse=True):
            result.append({
                "sector": sector,
                "amount": round(amt, 0),
                "weight": round(amt / total_asset * 100, 2) if total_asset else 0,
            })
        return result

    def get_contribution(self, holdings: list) -> list[dict]:
        """종목별 수익 기여도 (간단 버전)"""
        result = []
        for h in holdings:
            if hasattr(h, "eval_profit"):
                profit = h.eval_profit
                weight = h.current_weight
                result.append({
                    "code": h.code,
                    "name": h.name,
                    "sector": h.sector or "",
                    "market": h.market or "",
                    "current_weight": weight,
                    "eval_profit": profit,
                    "profit_rate": h.profit_rate,
                    "ls": h.ls,
                })
        return sorted(result, key=lambda x: x["eval_profit"], reverse=True)
