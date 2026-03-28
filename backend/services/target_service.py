"""
타겟/주문 보조 서비스
목표 비중 관리, 주문 필요 수량 계산
"""
import logging
from typing import Optional
from ..models.holding import HoldingModel, TargetUploadItem, LongShort

logger = logging.getLogger(__name__)

# 인메모리 타겟 비중 저장소 (추후 DB 연동 가능)
_target_store: dict[str, TargetUploadItem] = {}


class TargetService:
    def set_targets(self, targets: list[TargetUploadItem]):
        """타겟 비중 일괄 등록"""
        for t in targets:
            _target_store[t.code] = t
        logger.info(f"타겟 {len(targets)}개 등록")

    def get_targets(self) -> list[TargetUploadItem]:
        return list(_target_store.values())

    def clear_targets(self):
        _target_store.clear()

    def calculate_orders(
        self,
        holdings: list[HoldingModel],
        total_asset: float,
        target_items: Optional[list[TargetUploadItem]] = None,
    ) -> list[HoldingModel]:
        """
        목표 비중과 현재 비중 차이로 주문 필요 수량 계산
        실제 주문 송신은 하지 않습니다.
        """
        if target_items:
            target_map = {t.code: t.target_weight for t in target_items}
        else:
            target_map = {t.code: t.target_weight for t in _target_store.values()}

        result = []
        for h in holdings:
            target_w = target_map.get(h.code, h.target_weight)
            current_w = h.current_weight

            target_amount = total_asset * target_w / 100
            current_amount = h.eval_amount

            diff_amount = target_amount - current_amount
            if h.current_price > 0:
                order_qty = int(diff_amount / h.current_price)
            else:
                order_qty = 0

            updated = h.model_copy(update={
                "target_weight": target_w,
                "weight_diff": round(target_w - current_w, 2),
                "order_qty": order_qty,
                "order_amount": round(order_qty * h.current_price, 0),
            })
            result.append(updated)

        # 타겟에 있지만 미보유 종목 추가
        held_codes = {h.code for h in holdings}
        for code, tw in target_map.items():
            if code not in held_codes and tw > 0:
                result.append(HoldingModel(
                    code=code,
                    name=_target_store.get(code, TargetUploadItem(code=code, target_weight=tw)).name or code,
                    target_weight=tw,
                    weight_diff=tw,
                    order_qty=int(total_asset * tw / 100),  # 단가 없으면 금액으로 표시
                    ls=_target_store.get(code, TargetUploadItem(code=code, target_weight=tw)).ls,
                ))

        return sorted(result, key=lambda x: x.current_weight, reverse=True)
