from fastapi import APIRouter, Depends, Query
from ...services.account_service import AccountService
from ...services.portfolio_service import PortfolioService
from ...config import get_settings

router = APIRouter(prefix="/portfolio", tags=["portfolio"])
_port_svc = PortfolioService()


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


@router.get("/summary")
def get_portfolio_summary(acct_svc: AccountService = Depends(get_account_svc)):
    """포트폴리오 요약 (KPI 카드)"""
    summary, _ = acct_svc.get_holdings()
    return summary.model_dump()


@router.get("/performance")
def get_performance(days: int = Query(90, ge=10, le=365)):
    """일별 성과 차트 데이터"""
    perf = _port_svc.get_performance(days)
    return {"data": [p.model_dump() for p in perf]}


@router.get("/sector")
def get_sector_breakdown(acct_svc: AccountService = Depends(get_account_svc)):
    """섹터별 비중 분석"""
    summary, holdings = acct_svc.get_holdings()
    breakdown = _port_svc.get_sector_breakdown(holdings, summary.total_asset)
    return {"sectors": breakdown}


@router.get("/contribution")
def get_contribution(acct_svc: AccountService = Depends(get_account_svc)):
    """종목별 기여도"""
    _, holdings = acct_svc.get_holdings()
    data = _port_svc.get_contribution(holdings)
    return {"contribution": data}


@router.get("/analysis")
def get_full_analysis(
    days: int = Query(90, ge=10, le=365),
    acct_svc: AccountService = Depends(get_account_svc),
):
    """포트폴리오 분석 화면 전체 데이터"""
    summary, holdings = acct_svc.get_holdings()
    perf = _port_svc.get_performance(days)
    sectors = _port_svc.get_sector_breakdown(holdings, summary.total_asset)
    contribution = _port_svc.get_contribution(holdings)

    return {
        "summary": summary.model_dump(),
        "performance": [p.model_dump() for p in perf],
        "sectors": sectors,
        "contribution": contribution,
    }
