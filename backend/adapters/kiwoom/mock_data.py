"""
개발/테스트용 목 데이터
실계좌 API 없이도 UI 개발이 가능하도록 제공
실제 운용 시 환경변수로 비활성화
"""
from datetime import date, timedelta
import random

MOCK_HOLDINGS = [
    {"stk_cd": "A005930", "stk_nm": "삼성전자", "rmnd_qty": 1300, "pur_pric": 70000,
     "cur_prc": 71500, "evltv_prft": 1950000, "prft_rt": 2.14,
     "pred_close_pric": 70100, "trde_able_qty": 1300,
     "pred_buyq": 0, "pred_sellq": 0, "tdy_buyq": 0, "tdy_sellq": 0},
    {"stk_cd": "A000660", "stk_nm": "SK하이닉스", "rmnd_qty": 230, "pur_pric": 277000,
     "cur_prc": 288000, "evltv_prft": 2530000, "prft_rt": 3.97,
     "pred_close_pric": 277000, "trde_able_qty": 230,
     "pred_buyq": 0, "pred_sellq": 0, "tdy_buyq": 0, "tdy_sellq": 0},
    {"stk_cd": "A005830", "stk_nm": "DB손해보험", "rmnd_qty": 300, "pur_pric": 138000,
     "cur_prc": 139600, "evltv_prft": 480000, "prft_rt": 1.16,
     "pred_close_pric": 138500, "trde_able_qty": 300,
     "pred_buyq": 0, "pred_sellq": 0, "tdy_buyq": 0, "tdy_sellq": 0},
    {"stk_cd": "A032830", "stk_nm": "삼성생명", "rmnd_qty": 260, "pur_pric": 152000,
     "cur_prc": 157500, "evltv_prft": 1430000, "prft_rt": 3.62,
     "pred_close_pric": 152500, "trde_able_qty": 260,
     "pred_buyq": 0, "pred_sellq": 0, "tdy_buyq": 0, "tdy_sellq": 0},
    {"stk_cd": "A000810", "stk_nm": "삼성화재", "rmnd_qty": 83, "pur_pric": 458000,
     "cur_prc": 465500, "evltv_prft": 622500, "prft_rt": 1.64,
     "pred_close_pric": 459000, "trde_able_qty": 83,
     "pred_buyq": 0, "pred_sellq": 0, "tdy_buyq": 0, "tdy_sellq": 0},
    {"stk_cd": "A009150", "stk_nm": "삼성전기", "rmnd_qty": 175, "pur_pric": 178000,
     "cur_prc": 180300, "evltv_prft": 402500, "prft_rt": 1.29,
     "pred_close_pric": 178700, "trde_able_qty": 175,
     "pred_buyq": 0, "pred_sellq": 0, "tdy_buyq": 0, "tdy_sellq": 0},
    {"stk_cd": "A160190", "stk_nm": "하이젠알앤엠", "rmnd_qty": 6100, "pur_pric": 37200,
     "cur_prc": 37800, "evltv_prft": 3660000, "prft_rt": 1.61,
     "pred_close_pric": 37200, "trde_able_qty": 6100,
     "pred_buyq": 0, "pred_sellq": 0, "tdy_buyq": 0, "tdy_sellq": 0},
    {"stk_cd": "A004370", "stk_nm": "농심", "rmnd_qty": 48, "pur_pric": 412000,
     "cur_prc": 408000, "evltv_prft": -192000, "prft_rt": -0.97,
     "pred_close_pric": 412500, "trde_able_qty": 48,
     "pred_buyq": 0, "pred_sellq": 0, "tdy_buyq": 0, "tdy_sellq": 0},
    {"stk_cd": "A122870", "stk_nm": "와이지엔터테인먼트", "rmnd_qty": 178, "pur_pric": 101000,
     "cur_prc": 99200, "evltv_prft": -320400, "prft_rt": -1.78,
     "pred_close_pric": 101200, "trde_able_qty": 178,
     "pred_buyq": 0, "pred_sellq": 0, "tdy_buyq": 0, "tdy_sellq": 0},
    {"stk_cd": "A298380", "stk_nm": "에이비엘바이오", "rmnd_qty": 152, "pur_pric": 100300,
     "cur_prc": 103000, "evltv_prft": 410400, "prft_rt": 2.69,
     "pred_close_pric": 100500, "trde_able_qty": 152,
     "pred_buyq": 0, "pred_sellq": 0, "tdy_buyq": 0, "tdy_sellq": 0},
]

MOCK_SUMMARY = {
    "tot_pur_amt": "729800000",
    "tot_evlt_amt": "741250000",
    "tot_evlt_pl": "11450000",
    "tot_prft_rt": "1.57",
    "prsm_dpst_aset_amt": "800000000",
    "tot_loan_amt": "0",
    "tot_crd_loan_amt": "0",
    "tot_crd_ls_amt": "0",
}

MOCK_DEPOSIT = {
    "dnca_tot_amt": "58750000",   # 예수금 총액
    "nxdy_excc_amt": "58750000",  # 익일 정산 금액
}

SECTOR_MAP = {
    "A005930": {"sector": "반도체", "market": "KOSPI", "sz": "L", "sec": "IT", "group": "반도체"},
    "A000660": {"sector": "반도체", "market": "KOSPI", "sz": "L", "sec": "IT", "group": "반도체"},
    "A005830": {"sector": "금융", "market": "KOSPI", "sz": "L", "sec": "FI", "group": "금융"},
    "A032830": {"sector": "금융", "market": "KOSPI", "sz": "L", "sec": "FI", "group": "지주"},
    "A000810": {"sector": "금융", "market": "KOSPI", "sz": "L", "sec": "FI", "group": "금융"},
    "A009150": {"sector": "IT", "market": "KOSPI", "sz": "L", "sec": "IT", "group": ""},
    "A160190": {"sector": "기타", "market": "KOSDAQ", "sz": "M", "sec": "UN", "group": ""},
    "A004370": {"sector": "소비재", "market": "KOSPI", "sz": "M", "sec": "CO", "group": ""},
    "A122870": {"sector": "엔터", "market": "KOSDAQ", "sz": "M", "sec": "ET", "group": ""},
    "A298380": {"sector": "바이오", "market": "KOSDAQ", "sz": "L", "sec": "BI", "group": ""},
}

TARGET_WEIGHTS = {
    "A005930": 18.43,
    "A000660": 12.84,
    "A005830": 8.22,
    "A032830": 7.93,
    "A000810": 7.58,
    "A009150": 6.19,
    "A160190": 4.53,
    "A004370": 3.87,
    "A122870": 3.44,
    "A298380": 3.06,
}

MOCK_CONSTRAINTS = [
    {"name": "넷 익스포저", "current_value": 94.80, "expected_value": 94.80,
     "warning_line": 99, "violation_line": 100, "tolerance": None,
     "status": "정상", "violation_days": 0, "order_allowed": True},
    {"name": "1조이상 총 비중", "current_value": 94.80, "expected_value": 94.80,
     "warning_line": 92, "violation_line": 90, "tolerance": None,
     "status": "정상", "violation_days": 0, "order_allowed": True},
    {"name": "코스닥 총 비중", "current_value": 12.83, "expected_value": 12.83,
     "warning_line": 18, "violation_line": 20, "tolerance": None,
     "status": "정상", "violation_days": 0, "order_allowed": True},
    {"name": "1조미만 개별 비중", "current_value": None, "expected_value": None,
     "warning_line": 1.5, "violation_line": 2, "tolerance": None,
     "status": "정상", "violation_days": 0, "order_allowed": True},
    {"name": "주식 투자비중", "current_value": 94.80, "expected_value": 94.80,
     "warning_line": 92, "violation_line": 90, "tolerance": 100,
     "status": "정상", "violation_days": 0, "order_allowed": True},
    {"name": "주식 개별 비중", "current_value": None, "expected_value": None,
     "warning_line": 9, "violation_line": 10, "tolerance": None,
     "status": "정상", "violation_days": 0, "order_allowed": True},
    {"name": "삼성전자 비중", "current_value": 18.43, "expected_value": 18.43,
     "warning_line": 35, "violation_line": 40, "tolerance": None,
     "status": "정상", "violation_days": 0, "order_allowed": True,
     "stock_code": "A005930", "stock_name": "삼성전자"},
    {"name": "하이닉스 비중", "current_value": 12.84, "expected_value": 12.84,
     "warning_line": 10, "violation_line": 15, "tolerance": None,
     "status": "경고", "violation_days": 0, "order_allowed": True,
     "stock_code": "A000660", "stock_name": "SK하이닉스"},
    {"name": "LG엔솔 비중", "current_value": 0.88, "expected_value": 0.88,
     "warning_line": 10, "violation_line": 15, "tolerance": None,
     "status": "정상", "violation_days": 0, "order_allowed": True},
    {"name": "기준가(모니터링)", "current_value": 1036.38, "expected_value": 1036.38,
     "warning_line": None, "violation_line": None, "tolerance": None,
     "status": "모니터링", "violation_days": 0, "order_allowed": False,
     "sanction_exemption": True},
]


def get_mock_performance(days: int = 90):
    data = []
    base_nav = 1000.0
    cumul = 0.0
    today = date.today()
    for i in range(days, 0, -1):
        d = today - timedelta(days=i)
        if d.weekday() >= 5:
            continue
        daily = random.gauss(0.05, 0.8)
        cumul += daily
        base_nav = base_nav * (1 + daily / 100)
        data.append({
            "date": d.isoformat(),
            "nav": round(base_nav, 2),
            "daily_return": round(daily, 3),
            "cumulative_return": round(cumul, 3),
            "benchmark_return": round(random.gauss(0.03, 0.6), 3),
            "benchmark_cumul": round(cumul * 0.85, 3),
        })
    return data
