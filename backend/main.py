"""
Trading Operations Platform - FastAPI 백엔드
실계좌 보호: 조회 전용 모드가 기본값
실제 주문 기능은 order_enabled=True 플래그 없이는 동작하지 않음
"""
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import get_settings
from .api.routes import account, target, portfolio, research

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

settings = get_settings()

app = FastAPI(
    title="Trading Operations Platform",
    description="포트폴리오 운용, 주문 보조, 리서치, 모니터링 통합 플랫폼",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(account.router, prefix="/api/v1")
app.include_router(target.router, prefix="/api/v1")
app.include_router(portfolio.router, prefix="/api/v1")
app.include_router(research.router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "service": "Trading Operations Platform",
        "version": "1.0.0",
        "read_only_mode": settings.read_only_mode,
        "order_enabled": settings.order_enabled,
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "ok", "read_only": settings.read_only_mode}


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "type": type(exc).__name__},
    )
