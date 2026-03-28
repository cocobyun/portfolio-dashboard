from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from ...services.account_service import AccountService
from ...services.target_service import TargetService
from ...models.holding import TargetUploadItem
from ...config import get_settings

router = APIRouter(prefix="/target", tags=["target"])

_target_svc = TargetService()


def get_account_svc(use_mock: bool = Query(True)) -> AccountService:
    settings = get_settings()
    if use_mock or not settings.kiwoom_app_key:
        return AccountService(use_mock=True)
    from ...adapters.kiwoom.client import KiwoomClient
    client = KiwoomClient(
        app_key=settings.kiwoom_app_key,
        secret_key=settings.kiwoom_secret_key,
        host=settings.kiwoom_host,
        account_no=settings.kiwoom_account_no,
    )
    return AccountService(client=client, use_mock=False)


@router.get("/")
def get_target_view(acct_svc: AccountService = Depends(get_account_svc)):
    """
    타겟 화면 전체 데이터
    - 계좌 요약
    - 제약 조건
    - 보유 종목 + 목표 비중 + 주문 필요량
    """
    summary, holdings = acct_svc.get_holdings()
    constraints = acct_svc.get_constraints()
    holdings_with_orders = _target_svc.calculate_orders(holdings, summary.total_asset)

    long_holdings = [h for h in holdings_with_orders if h.ls.value == "L"]
    short_holdings = [h for h in holdings_with_orders if h.ls.value == "S"]

    return {
        "summary": summary.model_dump(),
        "constraints": [c.model_dump() for c in constraints],
        "long_target": [h.model_dump() for h in long_holdings],
        "short_target": [h.model_dump() for h in short_holdings],
    }


@router.post("/upload")
def upload_targets(targets: list[TargetUploadItem]):
    """목표 비중 업로드/갱신"""
    _target_svc.set_targets(targets)
    return {"message": f"{len(targets)}개 타겟 등록 완료"}


@router.delete("/clear")
def clear_targets():
    """타겟 초기화"""
    _target_svc.clear_targets()
    return {"message": "타겟 초기화 완료"}


@router.get("/order-calc")
def calculate_orders(
    acct_svc: AccountService = Depends(get_account_svc),
):
    """
    주문 필요 수량 계산 (조회 전용)
    실제 주문 송신 없음
    """
    summary, holdings = acct_svc.get_holdings()
    result = _target_svc.calculate_orders(holdings, summary.total_asset)
    return {
        "total_asset": summary.total_asset,
        "orders": [h.model_dump() for h in result if h.order_qty != 0],
        "note": "조회 전용 모드 - 실제 주문은 송신되지 않습니다.",
    }
