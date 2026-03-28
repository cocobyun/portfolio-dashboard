"""
키움증권 REST API 클라이언트
모든 API 호출은 이 모듈을 통해서만 수행됩니다.
민감정보(토큰, 계좌번호)는 백엔드에서만 처리됩니다.
"""
import logging
import requests
from typing import Any, Optional
from .token_manager import TokenManager

logger = logging.getLogger(__name__)

# 페이지네이션 최대 반복 횟수 (안전 장치)
MAX_PAGES = 20


class KiwoomClient:
    def __init__(self, app_key: str, secret_key: str, host: str, account_no: str):
        self._host = host
        self._account_no = account_no
        self._token_manager = TokenManager(app_key, secret_key, host)

    # ─────────────────────────────────────────────────
    # 내부 헬퍼
    # ─────────────────────────────────────────────────

    def _headers(self, api_id: str, cont_yn: str = "N", next_key: str = "") -> dict:
        return {
            "Content-Type": "application/json;charset=UTF-8",
            "authorization": f"Bearer {self._token_manager.get_token()}",
            "cont-yn": cont_yn,
            "next-key": next_key,
            "api-id": api_id,
        }

    def _post(
        self,
        endpoint: str,
        api_id: str,
        payload: dict,
        cont_yn: str = "N",
        next_key: str = "",
    ) -> dict:
        url = self._host + endpoint
        headers = self._headers(api_id, cont_yn, next_key)
        try:
            resp = requests.post(url, json=payload, headers=headers, timeout=15)
            resp.raise_for_status()
            return resp.json()
        except requests.exceptions.HTTPError as e:
            if resp.status_code == 401:
                # 토큰 만료 → 갱신 후 재시도
                logger.warning("401 응답 → 토큰 갱신 후 재시도")
                self._token_manager.invalidate()
                headers = self._headers(api_id, cont_yn, next_key)
                resp = requests.post(url, json=payload, headers=headers, timeout=15)
                resp.raise_for_status()
                return resp.json()
            raise

    def _paginate(self, endpoint: str, api_id: str, payload: dict) -> list[dict]:
        """연속 조회가 필요한 API에 대한 자동 페이지네이션"""
        results = []
        cont_yn = "N"
        next_key = ""

        for _ in range(MAX_PAGES):
            data = self._post(endpoint, api_id, payload, cont_yn, next_key)
            results.append(data)

            cont_yn = data.get("cont-yn", "N")
            next_key = data.get("next-key", "")
            if cont_yn != "Y" or not next_key:
                break

        return results

    # ─────────────────────────────────────────────────
    # 계좌 조회 API
    # ─────────────────────────────────────────────────

    def get_account_balance(self) -> dict:
        """
        kt00018: 계좌평가잔고내역 조회
        보유 종목 목록 + 계좌 요약 정보
        """
        payload = {
            "acnt_no": self._account_no,
            "qry_tp": "1",           # 1: 전체 조회
            "crcy_cd": "KRW",
        }
        pages = self._paginate("/api/dostk/acnt", "kt00018", payload)

        # 첫 페이지에서 요약 정보, 모든 페이지에서 종목 수집
        summary = {}
        holdings = []

        for i, page in enumerate(pages):
            if i == 0:
                summary = {k: v for k, v in page.items()
                           if k not in ("acnt_evlt_remn_indv_tot",)}
            holdings.extend(page.get("acnt_evlt_remn_indv_tot", []))

        return {"summary": summary, "holdings": holdings}

    def get_deposit(self) -> dict:
        """
        kt00001: 예수금 상세 현황 조회
        """
        payload = {"acnt_no": self._account_no, "qry_tp": "1"}
        return self._post("/api/dostk/acnt", "kt00001", payload)

    def get_current_price(self, stock_code: str) -> dict:
        """
        kt10001: 주식현재가 시세 조회
        """
        payload = {"stk_cd": stock_code}
        return self._post("/api/dostk/stkinfo", "kt10001", payload)

    def get_daily_chart(self, stock_code: str, start_date: str, end_date: str) -> dict:
        """
        kt10002: 주식 일별 시세 조회
        """
        payload = {
            "stk_cd": stock_code,
            "base_dt": end_date,
            "qry_tp": "0",   # 0: 일봉
        }
        return self._post("/api/dostk/stkinfo", "kt10002", payload)

    def get_investor_trend(self, stock_code: str, start_date: str, end_date: str) -> dict:
        """
        투자자별 매매동향 조회
        """
        payload = {
            "stk_cd": stock_code,
            "start_dt": start_date,
            "end_dt": end_date,
        }
        return self._post("/api/dostk/stkinfo", "kt10003", payload)

    def get_order_possible_qty(self, stock_code: str, price: int, order_type: str) -> dict:
        """
        주문 가능 수량 계산 (실제 주문 없이 계산만)
        order_type: "2" = 매수, "1" = 매도
        """
        payload = {
            "acnt_no": self._account_no,
            "stk_cd": stock_code,
            "ord_pric": str(price),
            "buy_sell_tp": order_type,
        }
        return self._post("/api/dostk/order", "kt00009", payload)
