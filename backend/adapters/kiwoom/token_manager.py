"""
키움증권 OAuth2 토큰 관리 모듈
토큰 발급, 캐싱, 만료 처리
"""
import time
import logging
import requests
from typing import Optional
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)

TOKEN_EXPIRY_BUFFER = 300  # 만료 5분 전에 갱신


@dataclass
class TokenCache:
    access_token: str
    expires_at: float  # Unix timestamp
    token_type: str = "Bearer"


class TokenManager:
    def __init__(self, app_key: str, secret_key: str, host: str):
        self._app_key = app_key
        self._secret_key = secret_key
        self._host = host
        self._cache: Optional[TokenCache] = None

    def get_token(self) -> str:
        if self._is_valid():
            return self._cache.access_token
        return self._issue_token()

    def _is_valid(self) -> bool:
        if not self._cache:
            return False
        return time.time() < (self._cache.expires_at - TOKEN_EXPIRY_BUFFER)

    def _issue_token(self) -> str:
        url = f"{self._host}/oauth2/token"
        payload = {
            "grant_type": "client_credentials",
            "appkey": self._app_key,
            "secretkey": self._secret_key,
        }
        headers = {"Content-Type": "application/json;charset=UTF-8"}

        try:
            resp = requests.post(url, json=payload, headers=headers, timeout=10)
            resp.raise_for_status()
            data = resp.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"토큰 발급 실패: {e}")
            raise RuntimeError(f"키움 토큰 발급 오류: {e}") from e

        token = data.get("token") or data.get("access_token")
        if not token:
            raise RuntimeError(f"토큰 필드 없음 - 응답: {data}")

        expires_in = int(data.get("expires_in", 86400))
        self._cache = TokenCache(
            access_token=token,
            expires_at=time.time() + expires_in,
            token_type=data.get("token_type", "Bearer"),
        )
        logger.info("키움 액세스 토큰 발급 완료")
        return token

    def invalidate(self):
        self._cache = None
