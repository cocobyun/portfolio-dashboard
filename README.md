# 🚀 실시간 포트폴리오 대시보드

키움증권 API를 이용한 실시간 포트폴리오 비중 확인 대시보드입니다.

## 📋 준비물

1. **키움증권 계좌**
2. **키움증권 OpenAPI 신청** (키움증권 홈페이지에서 신청)
   - API Key
   - Secret Key

## 🔧 설치 방법

### 1️⃣ Python 설치
- [Python 공식 홈페이지](https://www.python.org/downloads/)에서 Python 3.11 이상 다운로드 및 설치

### 2️⃣ 프로젝트 다운로드
```bash
git clone https://github.com/cocobyun/portfolio-dashboard.git
cd portfolio-dashboard
```

또는 GitHub에서 "Code" 버튼 클릭 → "Download ZIP" 으로 다운로드 후 압축 해제

### 3️⃣ 필요한 패키지 설치
터미널(명령 프롬프트)을 열고 다음 명령어 실행:
```bash
pip install -r requirements.txt
```

### 4️⃣ API 키 설정

1. `config.py.example` 파일을 복사하여 `config.py` 파일 생성
2. `config.py` 파일을 열어서 본인의 API 정보 입력:

```python
api_key = "본인의_API_KEY"
api_secret_key = "본인의_SECRET_KEY"
host = "https://mockapi.kiwoom.com"  # 모의투자용
# host = "https://api.kiwoom.com"  # 실전투자용 (실전일 경우 주석 해제)
```

⚠️ **주의**: `config.py` 파일은 절대 다른 사람과 공유하지 마세요!

## 🚀 실행 방법

터미널에서 다음 명령어 실행:
```bash
streamlit run web_dashboard_realtime.py
```

브라우저가 자동으로 열리며 대시보드가 표시됩니다.

## 📊 기능

- ✅ 실시간 주가 업데이트 (WebSocket)
- ✅ 포트폴리오 비중 자동 계산
- ✅ 자산 구성 시각화 (파이 차트)
- ✅ 종목별 수익률 차트
- ✅ 계좌 요약 정보

## ❓ 문제 해결

### streamlit 명령어를 찾을 수 없다고 나올 때
```bash
python -m streamlit run web_dashboard_realtime.py
```

### API 연결 오류가 날 때
- config.py 파일에 API Key가 올바르게 입력되었는지 확인
- 키움증권 OpenAPI 신청이 승인되었는지 확인
- 모의투자/실전투자 host 주소가 올바른지 확인

## 📞 문의

문제가 발생하면 Issues에 남겨주세요!

---

🚀 Powered by Streamlit & 키움증권 OpenAPI
