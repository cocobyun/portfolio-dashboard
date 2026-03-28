from fastapi import APIRouter, Depends, Query
from typing import Optional
from ...services.account_service import AccountService
from ...config import get_settings

router = APIRouter(prefix="/account", tags=["account"])


def get_service(use_mock: bool = Query(True, description="목 데이터 사용 여부")) -> AccountService:
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


@router.get("/holdings")
def get_holdings(svc: AccountService = Depends(get_service)):
    """보유 종목 및 계좌 요약 조회"""
    summary, holdings = svc.get_holdings()
    return {
        "summary": summary.model_dump(),
        "holdings": [h.model_dump() for h in holdings],
    }


@router.get("/constraints")
def get_constraints(svc: AccountService = Depends(get_service)):
    """규제/한도 제약 조건 조회"""
    rules = svc.get_constraints()
    return {"constraints": [r.model_dump() for r in rules]}
