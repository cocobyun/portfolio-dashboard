import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from datetime import datetime
import asyncio
import websocket
import json
import threading
import queue
from kiwoom_prettycoco1 import KiwoomTR
import time

# 페이지 설정
st.set_page_config(
    page_title="포트폴리오 실시간 비중",
    page_icon="💰",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# 커스텀 CSS
st.markdown("""
    <style>
    .main-header {
        font-size: 3rem;
        font-weight: bold;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-align: center;
        margin-bottom: 2rem;
    }
    .live-indicator {
        display: inline-block;
        width: 12px;
        height: 12px;
        background: #00ff00;
        border-radius: 50%;
        animation: blink 1s infinite;
        margin-right: 8px;
    }
    @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0.3; }
    }
    </style>
""", unsafe_allow_html=True)

# ==================== 실시간 WebSocket 연결 ====================

class RealtimePriceWebSocket:
    """키움증권 WebSocket을 통한 실시간 주가 수신"""
    
    def __init__(self):
        self.ws = None
        self.prices = {}  # {종목코드: 현재가}
        self.price_queue = queue.Queue()
        self.running = False
        self.last_update_time = {}
        
    def on_message(self, ws, message):
        """WebSocket 메시지 수신"""
        try:
            data = json.loads(message)
            
            # 실시간 체결 데이터 처리
            if data.get('msg_cd') == '0':  # 정상 수신
                ticker = data.get('stck_cano')  # 종목코드
                price = int(data.get('stck_prpr', 0))  # 현재가
                
                if ticker and price > 0:
                    self.prices[ticker] = price
                    self.price_queue.put({
                        'ticker': ticker,
                        'price': price,
                        'time': datetime.now()
                    })
                    self.last_update_time[ticker] = datetime.now()
                    
        except Exception as e:
            pass  # 실패해도 계속 진행
    
    def on_error(self, ws, error):
        """WebSocket 에러 처리"""
        pass
    
    def on_close(self, ws, close_status_code, close_msg):
        """WebSocket 연결 종료"""
        self.running = False
    
    def on_open(self, ws):
        """WebSocket 연결 시작"""
        self.running = True
    
    def connect(self, tickers):
        """WebSocket 연결 및 구독"""
        try:
            # 키움증권 실시간 WebSocket URL
            ws_url = "wss://openapi.kiwoom.com/websocket"
            
            self.ws = websocket.WebSocketApp(
                ws_url,
                on_message=self.on_message,
                on_error=self.on_error,
                on_close=self.on_close,
                on_open=self.on_open
            )
            
            # 백그라운드에서 실행
            wst = threading.Thread(target=self.ws.run_forever)
            wst.daemon = True
            wst.start()
            
            # 종목 구독 요청
            for ticker in tickers:
                subscribe_msg = {
                    'tr_id': 'H0STCNT0',  # 실시간 체결 API
                    'tr_key': ticker
                }
                time.sleep(0.05)  # API 레이트 리미트
                
                if self.ws:
                    self.ws.send(json.dumps(subscribe_msg))
                    
        except Exception as e:
            pass  # WebSocket 연결 실패해도 REST API로 폴백

# ==================== 글로벌 WebSocket 관리 ====================

@st.cache_resource
def get_websocket_manager():
    """WebSocket 관리자 초기화 (앱 전체에서 하나만 실행)"""
    return RealtimePriceWebSocket()

@st.cache_data(ttl=60)  # 1분마다 계좌 데이터 새로고침
def get_account_data():
    """계좌 데이터 조회"""
    try:
        kiwoom = KiwoomTR()
        params = {
            'qry_tp': '1',
            'dmst_stex_tp': 'KRX',
        }
        account_summary = kiwoom.fn_kt00018(params)
        return account_summary, None
    except Exception as e:
        return None, str(e)

def get_realtime_prices(websocket_manager, tickers):
    """WebSocket에서 실시간 가격 가져오기 (없으면 REST API 사용)"""
    prices = {}
    
    for ticker in tickers:
        # WebSocket에서 가격 확인
        if ticker in websocket_manager.prices:
            prices[ticker] = websocket_manager.prices[ticker]
        else:
            # WebSocket 없으면 REST API로 조회
            try:
                kiwoom = KiwoomTR()
                params = {'shcode': ticker}
                result = kiwoom.fn_kt00018(params)
                prices[ticker] = float(result.get('현재가', 0))
            except:
                prices[ticker] = 0
    
    return prices

# ==================== 메인 화면 ====================

st.markdown('<h1 class="main-header">🚀 실시간 포트폴리오 비중</h1>', unsafe_allow_html=True)

st.divider()

# ==================== 데이터 로드 ====================

with st.spinner("📊 계좌 정보를 불러오는 중..."):
    account_summary, error = get_account_data()

if error:
    st.error(f"❌ 데이터 조회 실패: {error}")
    st.stop()

if account_summary is None:
    st.error("❌ 계좌 데이터를 불러올 수 없습니다.")
    st.stop()

# ==================== 보유 종목 처리 ====================

stocks = account_summary.get('계좌평가잔고개별합산', [])

if not stocks:
    st.warning("⚠️ 보유 중인 종목이 없습니다")
    st.stop()

# WebSocket 초기화 및 구독
ws_manager = get_websocket_manager()
tickers = [stock.get('종목코드', '') for stock in stocks]

# 첫 연결 시에만 WebSocket 시작
if not ws_manager.running and tickers:
    ws_manager.connect(tickers)
    time.sleep(1)  # WebSocket 연결 대기

# 실시간 가격 조회
realtime_prices = get_realtime_prices(ws_manager, tickers)

# 현금
api_cash = int(account_summary.get('예수금', 0))

# ==================== 실시간 비중 계산 ====================

df_data = []
total_stock_value = 0

for stock in stocks:
    ticker = stock.get('종목코드', '')
    name = stock.get('종목명', '')
    quantity = int(stock.get('보유수량', 0))
    purchase_price = float(stock.get('매입가', 0))
    
    # 실시간 가격 사용 (WebSocket 또는 REST API)
    current_price = realtime_prices.get(ticker, float(stock.get('현재가', 0)))
    
    if quantity > 0:
        evaluation_amount = current_price * quantity
        profit_loss = int((current_price - purchase_price) * quantity)
        profit_rate = ((current_price - purchase_price) / purchase_price * 100) if purchase_price > 0 else 0
        
        df_data.append({
            '종목명': name,
            '종목코드': ticker,
            '보유수량': quantity,
            '매입가': purchase_price,
            '현재가': current_price,
            '평가금액': evaluation_amount,
            '손익금액': profit_loss,
            '수익률(%)': profit_rate
        })
        total_stock_value += evaluation_amount

# 총 자산
total_assets = total_stock_value + api_cash

# 비중 계산
for item in df_data:
    item['비중(%)'] = (item['평가금액'] / total_assets * 100) if total_assets > 0 else 0

# ==================== 메트릭 표시 ====================

st.subheader("💰 계좌 요약 (실시간)")

col1, col2, col3, col4 = st.columns(4)

with col1:
    st.metric(
        label="총 자산",
        value=f"{int(total_assets):,}원"
    )

with col2:
    st.metric(
        label="주식 평가액",
        value=f"{int(total_stock_value):,}원",
        delta=f"{(total_stock_value/total_assets*100):.1f}%" if total_assets > 0 else None
    )

with col3:
    st.metric(
        label="현금",
        value=f"{int(api_cash):,}원",
        delta=f"{(api_cash/total_assets*100):.1f}%" if total_assets > 0 else None
    )

with col4:
    total_profit = sum(item['손익금액'] for item in df_data)
    st.metric(
        label="총 수익금액",
        value=f"{int(total_profit):,}원",
        delta=f"{(total_profit/total_stock_value*100):.2f}%" if total_stock_value > 0 else None
    )

st.divider()

# ==================== 실시간 상태 표시 ====================

status_col1, status_col2, status_col3 = st.columns([2, 2, 2])

with status_col1:
    if ws_manager.running:
        st.markdown(f'<div class="live-indicator"></div>**실시간 수신 중** (WebSocket)', unsafe_allow_html=True)
    else:
        st.markdown('**주가 자동 갱신 중** (REST API - 1분 주기)')

with status_col2:
    st.caption(f"⏱️ 마지막 갱신: {datetime.now().strftime('%H:%M:%S')}")

with status_col3:
    if st.button("🔄 강제 새로고침"):
        st.cache_data.clear()
        st.rerun()

st.divider()

# ==================== 종목별 상세 정보 ====================

st.subheader("📋 보유 종목 (실시간 비중)")

df = pd.DataFrame(df_data)

# 표시 데이터 준비
df_display = df.copy()
df_display['현재가'] = df_display['현재가'].apply(lambda x: f"{int(x):,}원")
df_display['매입가'] = df_display['매입가'].apply(lambda x: f"{int(x):,}원")
df_display['평가금액'] = df_display['평가금액'].apply(lambda x: f"{int(x):,}원")
df_display['손익금액'] = df_display['손익금액'].apply(lambda x: f"{int(x):,}원")
df_display['수익률(%)'] = df_display['수익률(%)'].apply(lambda x: f"{x:.2f}%")
df_display['비중(%)'] = df_display['비중(%)'].apply(lambda x: f"{x:.2f}%")

# 테이블 표시
st.dataframe(
    df_display[['종목명', '보유수량', '매입가', '현재가', '평가금액', '비중(%)', '손익금액', '수익률(%)']],
    use_container_width=True,
    hide_index=True,
    height=400
)

st.divider()

# ==================== 실시간 비중 시각화 ====================

st.subheader("📊 실시간 비중 분석")

chart_col1, chart_col2 = st.columns(2)

# 비중 파이 차트
with chart_col1:
    st.markdown("**자산 구성 비중 (실시간)**")
    
    chart_data = df[['종목명', '평가금액', '비중(%)']].copy()
    
    # 현금 추가
    cash_ratio = (api_cash / total_assets * 100) if total_assets > 0 else 0
    cash_row = pd.DataFrame({
        '종목명': ['현금'],
        '평가금액': [api_cash],
        '비중(%)': [cash_ratio]
    })
    chart_data = pd.concat([chart_data, cash_row], ignore_index=True)
    
    fig_pie = px.pie(
        chart_data,
        values='평가금액',
        names='종목명',
        hole=0.4,
        color_discrete_sequence=px.colors.sequential.Purples_r
    )
    fig_pie.update_traces(
        textposition='inside',
        textinfo='label+percent'
    )
    st.plotly_chart(fig_pie, use_container_width=True)

# 수익률 막대 차트
with chart_col2:
    st.markdown("**종목별 수익률**")
    
    fig_bar = px.bar(
        df,
        x='종목명',
        y='수익률(%)',
        color='수익률(%)',
        color_continuous_scale=['red', 'lightgray', 'green'],
        color_continuous_midpoint=0
    )
    fig_bar.update_layout(showlegend=False)
    st.plotly_chart(fig_bar, use_container_width=True)

st.divider()

# ==================== 푸터 ====================

st.markdown("""
    <div style='text-align: center; color: gray; padding: 2rem;'>
        <p>🚀 Powered by Streamlit & 키움증권 OpenAPI (WebSocket)</p>
        <p style='font-size: 0.8rem;'>
            ⚡ WebSocket: 0.5~2초 지연<br>
            📡 REST API 폴백: 1분 주기 갱신<br>
            비중은 주가 변동에 따라 실시간으로 업데이트됩니다
        </p>
    </div>
""", unsafe_allow_html=True)