# 🚂 Railway 배포 환경변수 (포트 5000번대)

## 📊 **포트 구성 변경**
- **5000**: cleanair-route (메인 API)
- **5001**: data-ingestion (데이터 수집)
- **5002**: ai-prediction (AI 예측)
- **5003**: route-logic (경로 로직)

---

## 🏢 **1. 메인 API 서비스 (cleanair-route) - 포트 5000**

### **Railway 환경변수 설정**
```bash
# 데이터베이스 (PostgreSQL 서비스 추가 시 자동 생성)
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway

# 보안 설정
SECRET_KEY=your-super-secret-key-change-in-production-12345
ACCESS_TOKEN_EXPIRE_MINUTES=30

# 외부 API 키
AIRKOREA_API_KEY=your_airkorea_api_key_here
KMA_API_KEY=your_kma_api_key_here
KAKAO_MAP_KEY=your_kakao_map_key_here

# 서비스 URL (Railway 내부 통신용)
AI_PREDICTION_SERVICE_URL=http://ai-prediction:5002
DATA_INGESTION_SERVICE_URL=http://data-ingestion:5001

# CORS 설정 (Vercel 배포 후 업데이트)
ALLOWED_ORIGINS=https://your-frontend-app.vercel.app,http://localhost:3000

# 앱 설정
APP_NAME=CleanAir Route API
APP_VERSION=1.0.0
DEBUG=false
API_V1_PREFIX=/api/v1
LOG_LEVEL=INFO
```

### **Railway 배포 명령어**
```bash
cd backend/cleanair-route
railway up
```

---

## 📊 **2. 데이터 수집 서비스 (data-ingestion) - 포트 5001**

### **Railway 환경변수 설정**
```bash
# 데이터베이스 (PostgreSQL 서비스 추가 시 자동 생성)
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway

# Redis 설정 (선택사항)
REDIS_URL=redis://default:password@containers-us-west-xxx.railway.app:6379

# 외부 API 키
AIRKOREA_API_KEY=your_airkorea_api_key_here
KMA_API_KEY=your_kma_api_key_here

# 서비스 설정
SERVICE_PORT=5001
SERVICE_NAME=data-ingestion

# 로깅 설정
LOG_LEVEL=INFO
```

### **Railway 배포 명령어**
```bash
cd backend/services/data-ingestion
railway up
```

---

## 🤖 **3. AI 예측 서비스 (ai-prediction) - 포트 5002**

### **Railway 환경변수 설정**
```bash
# 데이터베이스 (PostgreSQL 서비스 추가 시 자동 생성)
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway

# Redis 설정 (선택사항)
REDIS_URL=redis://default:password@containers-us-west-xxx.railway.app:6379

# 모델 설정
MODEL_PATH=/app/models/model.pkl
SCALER_PATH=/app/models/scaler.pkl

# 서비스 설정
SERVICE_PORT=5002
SERVICE_NAME=ai-prediction

# 로깅 설정
LOG_LEVEL=INFO
```

### **Railway 배포 명령어**
```bash
cd backend/services/ai-prediction
railway up
```

---

## 🗺️ **4. 경로 로직 서비스 (route-logic) - 포트 5003**

### **Railway 환경변수 설정**
```bash
# 데이터베이스 (PostgreSQL 서비스 추가 시 자동 생성)
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway

# Redis 설정 (선택사항)
REDIS_URL=redis://default:password@containers-us-west-xxx.railway.app:6379

# 외부 API 키
KAKAO_MAP_KEY=your_kakao_map_key_here

# 서비스 URL (Railway 내부 통신용)
AI_PREDICTION_URL=http://ai-prediction:5002
DATA_INGESTION_URL=http://data-ingestion:5001

# 서비스 설정
SERVICE_PORT=5003
SERVICE_NAME=route-logic

# 로깅 설정
LOG_LEVEL=INFO
```

### **Railway 배포 명령어**
```bash
cd backend/services/route-logic
railway up
```

---

## 🔄 **서비스 간 통신 URL**

### **Railway 내부 통신**
```bash
# 메인 API → AI 예측 서비스
AI_PREDICTION_SERVICE_URL=http://ai-prediction:5002

# 메인 API → 데이터 수집 서비스
DATA_INGESTION_SERVICE_URL=http://data-ingestion:5001

# 경로 로직 → AI 예측 서비스
AI_PREDICTION_URL=http://ai-prediction:5002

# 경로 로직 → 데이터 수집 서비스
DATA_INGESTION_URL=http://data-ingestion:5001
```

### **외부 접근 URL (Railway 도메인)**
```bash
# 각 서비스의 Railway 도메인
https://cleanair-route-production.up.railway.app     # 메인 API
https://data-ingestion-production.up.railway.app     # 데이터 수집
https://ai-prediction-production.up.railway.app      # AI 예측
https://route-logic-production.up.railway.app        # 경로 로직
```

---

## 🚀 **Railway 배포 순서**

### **1단계: PostgreSQL 서비스 추가**
```bash
# Railway 대시보드에서
New Service → Database → PostgreSQL
# 자동으로 DATABASE_URL 생성됨
```

### **2단계: 각 서비스별 배포**
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

### **3단계: 환경변수 설정**
각 서비스의 Railway 대시보드 → **Variables** 탭에서 위의 환경변수들을 설정

---

## 🔧 **Railway 서비스 설정**

### **각 서비스별 railway.json**
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "python -m uvicorn main:app --host 0.0.0.0 --port $PORT",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### **포트 설정**
Railway는 `$PORT` 환경변수를 자동으로 제공하므로, 각 서비스는 이 포트를 사용합니다.

---

## 📊 **헬스체크 엔드포인트**

각 서비스의 헬스체크 URL:
```bash
# 메인 API
GET https://cleanair-route-production.up.railway.app/health

# 데이터 수집
GET https://data-ingestion-production.up.railway.app/health

# AI 예측
GET https://ai-prediction-production.up.railway.app/health

# 경로 로직
GET https://route-logic-production.up.railway.app/health
```

---

## ⚠️ **중요 주의사항**

### **🔐 보안**
- `SECRET_KEY`는 강력한 랜덤 문자열 사용
- API 키는 Railway 환경변수에서만 관리
- `DEBUG=false`로 프로덕션 설정

### **🌐 CORS**
- `ALLOWED_ORIGINS`에 정확한 프론트엔드 도메인만 포함
- Vercel 배포 후 실제 도메인으로 업데이트

### **🔄 서비스 통신**
- Railway 내부에서는 서비스명으로 통신
- 외부에서는 Railway 도메인으로 접근

### **📊 모니터링**
- Railway 대시보드에서 각 서비스 상태 확인
- 로그 및 메트릭 모니터링
- 데이터베이스 연결 상태 확인

**포트 5000번대로 Railway 배포 준비 완료!** 🎯
