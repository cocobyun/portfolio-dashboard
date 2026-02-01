import requests
import json
import time
from config import api_key, api_secret_key, host
import pandas as pd	
import functools
import inspect
import logging

# 로거 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def log_exceptions(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        try:
            sig = inspect.signature(func)
            params = sig.parameters
            param_len = len(params)
            
            if 'self' in params:
                param_len -= 1
            
            new_args = args[:param_len+1]

            return func(*args, **kwargs)
        except Exception:
            logger.exception(f"Exception occured in {func.__name__}")

    return wrapper

# 접근토큰 발급
class KiwoomTR:
    def __init__(self):
        self.token = self.login()  # 로그인해서 토큰 가져오기

    @staticmethod
    def login():
        params = {
            'grant_type': 'client_credentials',
            'appkey': api_key,  # API 키
            'secretkey': api_secret_key,  # API 비밀 키
        }
        url = host + '/oauth2/token'

        headers = {'Content-Type': 'application/json;charset=UTF-8'}
        response = requests.post(url, headers=headers, json=params)
        try:
            response.raise_for_status()  # 응답이 오류일 경우 예외 발생
        except requests.HTTPError as e:
            error_message = f"HTTP Error: {e}\nResponse Body: {response.text}"
            raise requests.HTTPError(error_message) from e
        token = response.json()['token']  # 발급받은 토큰 반환
        logger.info(f"Access token obtained: {token}")
        return token

    # 종목정보 리스트
    def fn_ka10099(self, data, cont_yn='N', next_key=''):
        # 1. 요청할 API URL
        endpoint = '/api/dostk/stkinfo'
        url =  host + endpoint

        # 2. header 데이터
        headers = {
            'Content-Type': 'application/json;charset=UTF-8', # 컨텐츠타입
            'authorization': f'Bearer {self.token}', # 접근토큰
            'cont-yn': cont_yn, # 연속조회여부
            'next-key': next_key, # 연속조회키
            'api-id': 'ka10099', # TR명
        }

        # 3. http POST 요청
        response = requests.post(url, headers=headers, json=data)
        try:
            response.raise_for_status()  # 응답이 오류일 경우 예외 발생
        except requests.HTTPError as e:
            error_message = f"HTTP Error: {e}\nResponse Body: {response.text}"
            raise requests.HTTPError(error_message) from e
        return response.json()['list']

    # 일별주가요청
    @log_exceptions
    def fn_ka10086(self, data, cont_yn='Y', next_key=''):	
        endpoint = '/api/dostk/mrkcond'
        url =  host + endpoint

        # 2. header 데이터
        headers = {
            'Content-Type': 'application/json;charset=UTF-8', # 컨텐츠타입
            'authorization': f'Bearer {self.token}', # 접근토큰
            'cont-yn': cont_yn, # 연속조회여부
            'next-key': next_key, # 연속조회키
            'api-id': 'ka10086', # TR명
        }
        response = requests.post(url, headers=headers, json=data)
        try:
            response.raise_for_status()  # 응답이 오류일 경우 예외 발생
        except requests.HTTPError as e:
            error_message = f"HTTP Error: {e}\nResponse Body: {response.text}"
            raise requests.HTTPError(error_message) from e
        has_next = response.headers.get('cont-yn') == 'Y'  # 연속 조회 여부
        next_key = response.headers.get('next-key')  # 다음 데이터 요청 키
        res = response.json()['daly_stkpc']
        df= pd.DataFrame(res)
        df=df[:-1].reset_index(drop=True)  # 마지막 행 제거 npx -y @smithery/cli@latest inspect @smithery-ai/server-sequential-thinking후 인덱스 재설정
        for column_name in ['open_pric', 'high_pric', 'low_pric', 'close_pric']:
            df[column_name] = df[column_name].apply(lambda x: abs(int(x)))
        column_name_to_kor_name_map = {
            "date": "날짜",
            "open_pric": "시가",
            "high_pric": "고가",
            "low_pric": "저가",
            "close_pric": "종가",
            "pred_rt": "전일비",
            "flu_rt": "등락률",
            "trde_qty": "거래량",
            "amt_mn": "금액(백만)",
            "crd_rt": "신용비",
            "ind": "개인",
            "orgn": "기관",
            "for_qty": "외인수량",
            "frgn": "외국계",
            "prm": "프로그램",
            "for_rt": "외인비",
            "for_poss": "외인보유",
            "for_wght": "외인비중",
            "for_netprps": "외인순매수",
            "orgn_netprps": "기관순매수",
            "ind_netprps": "개인순매수",
            "crd_remn_rt": "신용잔고율",
        }

        df.rename(columns=column_name_to_kor_name_map, inplace=True)  # 컬럼명 변경
        return df, has_next, next_key  # DataFrame과 연속 조회 여부, 다음 키 반환

    @log_exceptions
    # 계좌평가잔고내역요청
    def fn_kt00018(self, data, cont_yn='N', next_key=''):
        endpoint = '/api/dostk/acnt'
        url =  host + endpoint

        # 2. header 데이터
        headers = {
            'Content-Type': 'application/json;charset=UTF-8', # 컨텐츠타입
            'authorization': f'Bearer {self.token}', # 접근토큰
            'cont-yn': cont_yn, # 연속조회여부
            'next-key': next_key, # 연속조회키
            'api-id': 'kt00018', # TR명
        }

        response = requests.post(url, headers=headers, json=data)
        try:
            response.raise_for_status()  # 응답이 오류일 경우 예외 발생
        except requests.HTTPError as e:
            error_message = f"HTTP Error: {e}\nResponse Body: {response.text}"
            raise requests.HTTPError(error_message) from e
        res = response.json()

        def get_account_summary(res):
            account_summary = {
                "총매입금액": res['tot_pur_amt'],
                "총평가금액": res['tot_evlt_amt'],
                "총평가손익금액": res['tot_evlt_pl'],
                "총수익률(%)": res['tot_prft_rt'],
                "추정예탁자산": res['prsm_dpst_aset_amt'],
                "총대출금": res['tot_loan_amt'],
                "총융자금액": res['tot_crd_loan_amt'],
                "총대주금액": res['tot_crd_ls_amt'],
                "계좌평가잔고개별합산": []
            }

            for 종목 in res['acnt_evlt_remn_indv_tot']:
                종목정보 = {
                    "종목번호": 종목['stk_cd'],
                    "종목명": 종목['stk_nm'],
                    "평가손익": 종목['evltv_prft'],
                    "수익률(%)": 종목['prft_rt'],
                    "매입가": 종목['pur_pric'],
                    "전일종가": 종목['pred_close_pric'],
                    "보유수량": 종목['rmnd_qty'],
                    "매매가능수량": 종목['trde_able_qty'],
                    "현재가": 종목['cur_prc'],
                    "전일매수수량": 종목['pred_buyq'],
                    "전일매도수량": 종목['pred_sellq'],
                    "금일매수수량": 종목['tdy_buyq'],
                    "금일매도수량": 종목['tdy_sellq'],
                    "매입금액": 종목['pur_amt'],
                    "매입수수료": 종목['pur_cmsn'],
                    "평가금액": 종목['evlt_amt'],
                    "평가수수료": 종목['sell_cmsn'],
                    "세금": 종목['tax'],
                    "수수료합": 종목['sum_cmsn'],
                    "보유비중(%)": 종목['poss_rt'],
                    "신용구분": 종목['crd_tp'],
                    "신용구분명": 종목['crd_tp_nm'],
                    "대출일": 종목['crd_loan_dt'],
                }
                account_summary["계좌평가잔고개별합산"].append(종목정보)

            return account_summary

        return get_account_summary(res)


    # 거래대금상위요청
    def fn_ka10032(self, data, cont_yn='Y', next_key=''):
        endpoint = '/api/dostk/acnt'
        url =  host + endpoint

        # 2. header 데이터
        headers = {
            'Content-Type': 'application/json;charset=UTF-8', # 컨텐츠타입
            'authorization': f'Bearer {self.token}', # 접근토큰
            'cont-yn': cont_yn, # 연속조회여부
            'next-key': next_key, # 연속조회키
            'api-id': 'ka10032', # TR명
        }

        response = requests.post(url, headers=headers, json=data)
        try:
            response.raise_for_status()  # 응답이 오류일 경우 예외 발생
        except requests.HTTPError as e:
            error_message = f"HTTP Error: {e}\nResponse Body: {response.text}"
            raise requests.HTTPError(error_message) from e

        df=pd.DataFrame(response.json()['trde_prica_upper'])
        print(df)  
        return df

    def get_ranking(self, data, req_count=3):
        dfs = []
        next_key = ''
        has_next = False
        for i in range(req_count):
            time.sleep(1)
            df, has_next, next_key = self.fn_ka10032(
                data=data, 
                cont_yn='Y' if has_next else 'N',
                next_key=next_key,
            )

            dfs.append(df)
            if not has_next:
                break
        all_df = pd.concat(dfs).reset_index(drop=True)
        all_df.reset_index(drop=True, inplace=True)
        return all_df

    # 주식시분요청
    def fn_ka10006(self, data, cont_yn='Y', next_key=''):
        endpoint = '/api/dostk/mrkcond'
        url =  host + endpoint

        # 2. header 데이터
        headers = {
            'Content-Type': 'application/json;charset=UTF-8', # 컨텐츠타입
            'authorization': f'Bearer {self.token}', # 접근토큰
            'cont-yn': cont_yn, # 연속조회여부
            'next-key': next_key, # 연속조회키
            'api-id': 'ka10006', # TR명
        }

        # 3. http POST 요청
        response = requests.post(url, headers=headers, json=data)
        # HTTP POST 요청
        try:
            response.raise_for_status()  # 응답이 오류일 경우 예외 발생
        except requests.HTTPError as e:
            error_message = f"HTTP Error: {e}\nResponse Body: {response.text}"
            raise requests.HTTPError(error_message) from e
        res = response.json()
        return dict(
            date=res['date'],
            open=res['open_pric'],  # 시가
            high=res['high_pric'],  # 고가
            low=res['low_pric'],  # 저가
            close=res['close_pric'],  # 종가
        )

# 예시 실행
if __name__ == "__main__":
    kiwoom_tr = KiwoomTR()  # 로그인 후 토큰 발급받기
    params = {
		'qry_tp': '1', # 조회구분 1:합산, 2:개별
		'dmst_stex_tp': 'KRX', # 국내거래소구분 KRX:한국거래소,NXT:넥스트트레이드
	}

    basic_info_dict = kiwoom_tr.fn_kt00018(params)  # 시세 정보 요청
    print(basic_info_dict)  # 결과 출력


















# WebSocket 관련 코드
import asyncio
import websockets
import datetime

# socket 정보
SOCKET_URL = 'wss://mockapi.kiwoom.com:10000/api/dostk/websocket'  # 모의투자 접속 URL
#SOCKET_URL = 'wss://api.kiwoom.com:10000/api/dostk/websocket'  # 접속 URL
ACCESS_TOKEN = 'WSGg55JoX1z01rib9U4pNKnNomGyZ6qRF3bdYfnJa7DDl6mijCRPVlXAwqQpWJVQFqMtpIzpSusLevg_UeyjJQ'  # 고객 Access Token
INDEX_FILE = 'start_index.json'

class WebSocketClient:
    def __init__(self, uri):
        self.uri = uri
        self.websocket = None
        self.connected = False
        self.keep_running = True

    # WebSocket 서버에 연결합니다.
    async def connect(self):
        try:
            self.websocket = await websockets.connect(self.uri)
            self.connected = True
            print("서버와 연결을 시도 중입니다.")

            # 로그인 패킷
            param = {
                'trnm': 'LOGIN',
                'token': ACCESS_TOKEN
            }

            print('실시간 시세 서버로 로그인 패킷을 전송합니다.')
            # 웹소켓 연결 시 로그인 정보 전달
            await self.send_message(message=param)

        except Exception as e:
            print(f'Connection error: {e}')
            self.connected = False

    # 서버에 메시지를 보냅니다. 연결이 없다면 자동으로 연결합니다.
    async def send_message(self, message):
        if not self.connected:
            await self.connect()  # 연결이 끊어졌다면 재연결
        if self.connected:
            # message가 문자열이 아니면 JSON으로 직렬화
            if not isinstance(message, str):
                message = json.dumps(message)

        await self.websocket.send(message)
        print(f'Message sent: {message}')

    # 서버에서 오는 메시지를 수신하여 출력합니다.
    async def receive_messages(self):
        while self.keep_running:
            try:
                # 서버로부터 수신한 메시지를 JSON 형식으로 파싱
                response = json.loads(await self.websocket.recv())

                # 메시지 유형이 LOGIN일 경우 로그인 시도 결과 체크
                if response.get('trnm') == 'LOGIN':
                    if response.get('return_code') != 0:
                        print('로그인 실패하였습니다. : ', response.get('return_msg'))
                        await self.disconnect()
                    else:
                        print('로그인 성공하였습니다.')

                # 메시지 유형이 PING일 경우 수신값 그대로 송신
                elif response.get('trnm') == 'PING':
                    await self.send_message(response)

                if response.get('trnm') != 'PING':
                    print(f'실시간 시세 서버 응답 수신: {response}')

            except websockets.ConnectionClosed:
                print('Connection closed by the server')
                self.connected = False
                await self.websocket.close()

    # WebSocket 실행
    async def run(self):
        await self.connect()
        await self.receive_messages()

    # WebSocket 연결 종료
    async def disconnect(self):
        self.keep_running = False
        if self.connected and self.websocket:
            await self.websocket.close()
            self.connected = False
            print('Disconnected from WebSocket server')

async def main():
    # WebSocketClient 전역 변수 선언
    websocket_client = WebSocketClient(SOCKET_URL)

    # WebSocket 클라이언트를 백그라운드에서 실행합니다.
    receive_task = asyncio.create_task(websocket_client.run())

    # 실시간 항목 등록
    await asyncio.sleep(1)
    await websocket_client.send_message({ 
        'trnm': 'REG', # 서비스명
        'grp_no': '1', # 그룹번호
        'refresh': '1', # 기존등록유지여부
        'data': [{ # 실시간 등록 리스트
            'item': ['001'], # 실시간 등록 요소
            'type': ['0J'], # 실시간 항목
        }]
    })

    # 수신 작업이 종료될 때까지 대기
    await receive_task

# asyncio로 프로그램을 실행합니다.
if __name__ == '__main__':
    # TR API 테스트
    kiwoom_tr = KiwoomTR()  # 로그인 후 토큰 발급받기
    params = {
        'stk_cd': '005930_AL',  # 종목 코드 (삼성전자)
    }

    basic_info_dict = kiwoom_tr.fn_ka10006(params)  # 시세 정보 요청
    print(basic_info_dict)  # 결과 출력
    
    # WebSocket 테스트 (선택사항)
    # asyncio.run(main())