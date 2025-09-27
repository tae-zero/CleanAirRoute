# 🐳 Docker & Railway 포트 5000번대 업데이트 완료

## ✅ **업데이트된 파일들**

### **🏢 메인 API 서비스 (cleanair-route)**
- ✅ `main.py`: 포트 5000으로 변경
- ✅ `Dockerfile`: EXPOSE 5000, CMD 포트 5000
- ✅ `railway.json`: `$PORT` 사용 (Railway 자동 할당)
- ✅ `config.py`: 서비스 URL 5000번대로 변경

### **📊 데이터 수집 서비스 (data-ingestion)**
- ✅ `main.py`: 포트 5001로 변경
- ✅ `Dockerfile`: EXPOSE 5001, CMD 포트 5001
- ✅ `railway.json`: `$PORT` 사용
- ✅ `requirements.txt`: 필요한 패키지 추가

### **🤖 AI 예측 서비스 (ai-prediction)**
- ✅ `main.py`: 포트 5002로 변경
- ✅ `Dockerfile`: EXPOSE 5002, CMD 포트 5002
- ✅ `railway.json`: `$PORT` 사용
- ✅ `requirements.txt`: ML 패키지 포함

### **🗺️ 경로 로직 서비스 (route-logic)**
- ✅ `main.py`: 포트 5003으로 변경
- ✅ `Dockerfile`: EXPOSE 5003, CMD 포트 5003
- ✅ `railway.json`: `$PORT` 사용
- ✅ `requirements.txt`: 필요한 패키지 추가

---

## 🚂 **Railway 배포 시 포트 처리**

### **Railway의 포트 관리**
Railway는 각 서비스에 자동으로 포트를 할당합니다:
- `$PORT` 환경변수를 통해 포트 번호 제공
- `railway.json`의 `startCommand`에서 `$PORT` 사용
- 실제 포트는 Railway가 자동으로 관리

### **로컬 개발 vs Railway 배포**
```bash
# 로컬 개발 (고정 포트)
uvicorn main:app --host 0.0.0.0 --port 5000

# Railway 배포 (동적 포트)
uvicorn main:app --host 0.0.0.0 --port $PORT
```

---

## 🐳 **Docker 빌드 및 실행**

### **로컬 Docker 실행**
```bash
# 메인 API 서비스
cd backend/cleanair-route
docker build -t cleanair-route .
docker run -p 5000:5000 cleanair-route

# 데이터 수집 서비스
cd backend/services/data-ingestion
docker build -t data-ingestion .
docker run -p 5001:5001 data-ingestion

# AI 예측 서비스
cd backend/services/ai-prediction
docker build -t ai-prediction .
docker run -p 5002:5002 ai-prediction

# 경로 로직 서비스
cd backend/services/route-logic
docker build -t route-logic .
docker run -p 5003:5003 route-logic
```

### **Docker Compose (로컬 개발)**
```yaml
version: '3.8'
services:
  cleanair-route:
    build: ./backend/cleanair-route
    ports:
      - "5000:5000"
  
  data-ingestion:
    build: ./backend/services/data-ingestion
    ports:
      - "5001:5001"
  
  ai-prediction:
    build: ./backend/services/ai-prediction
    ports:
      - "5002:5002"
  
  route-logic:
    build: ./backend/services/route-logic
    ports:
      - "5003:5003"
```

---

## 🚀 **Railway 배포 명령어**

### **각 서비스별 배포**
```bash
# 1. 메인 API 서비스
cd backend/cleanair-route
railway up

# 2. 데이터 수집 서비스
cd backend/services/data-ingestion
railway up

# 3. AI 예측 서비스
cd backend/services/ai-prediction
railway up

# 4. 경로 로직 서비스
cd backend/services/route-logic
railway up
```

### **Railway 환경변수 설정**
각 서비스의 Railway 대시보드 → **Variables** 탭에서:
```bash
# 공통 환경변수
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway

# 서비스별 환경변수는 RAILWAY_5000_PORTS_ENV_VARS.md 참조
```

---

## 🔧 **포트 충돌 방지**

### **포트 5000번대 사용 이유**
- ✅ 8000번대는 다른 서비스와 충돌 가능성
- ✅ 5000번대는 개발용 포트로 안전
- ✅ Railway에서 자동 포트 할당 시 충돌 없음

### **로컬 개발 시 주의사항**
```bash
# 포트 사용 확인
netstat -an | grep :5000
netstat -an | grep :5001
netstat -an | grep :5002
netstat -an | grep :5003

# 포트 해제 (필요 시)
lsof -ti:5000 | xargs kill -9
```

---

## 📊 **서비스 간 통신 URL**

### **로컬 개발**
```bash
http://localhost:5000  # 메인 API
http://localhost:5001  # 데이터 수집
http://localhost:5002  # AI 예측
http://localhost:5003  # 경로 로직
```

### **Railway 배포**
```bash
https://cleanair-route-production.up.railway.app
https://data-ingestion-production.up.railway.app
https://ai-prediction-production.up.railway.app
https://route-logic-production.up.railway.app
```

---

## ✅ **완료된 작업**

- ✅ 모든 서비스의 포트를 5000번대로 변경
- ✅ Dockerfile의 EXPOSE 및 CMD 포트 업데이트
- ✅ railway.json의 startCommand 설정
- ✅ 서비스 간 통신 URL 업데이트
- ✅ requirements.txt 파일 생성
- ✅ 환경변수 설정 가이드 작성

**이제 포트 5000번대로 Railway 배포가 가능합니다!** 🎯
