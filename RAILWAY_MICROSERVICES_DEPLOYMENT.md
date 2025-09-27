# 🚂 Railway 마이크로서비스 배포 가이드

## 📁 **루트 디렉토리 설정**

### **각 서비스별 루트 디렉토리**
```bash
# 1. 메인 API 서비스
Root Directory: backend/cleanair-route

# 2. 데이터 수집 서비스
Root Directory: backend/services/data-ingestion

# 3. AI 예측 서비스
Root Directory: backend/services/ai-prediction

# 4. 경로 로직 서비스
Root Directory: backend/services/route-logic
```

---

## 🏢 **1. 메인 API 서비스 (cleanair-route)**

### **📁 루트 디렉토리**
```
backend/cleanair-route
```

### **🔧 Railway 환경변수**
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

### **🚀 배포 명령어**
```bash
cd backend/cleanair-route
railway up
```

---

## 📊 **2. 데이터 수집 서비스 (data-ingestion)**

### **📁 루트 디렉토리**
```
backend/services/data-ingestion
```

### **🔧 Railway 환경변수**
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

### **🚀 배포 명령어**
```bash
cd backend/services/data-ingestion
railway up
```

---

## 🤖 **3. AI 예측 서비스 (ai-prediction)**

### **📁 루트 디렉토리**
```
backend/services/ai-prediction
```

### **🔧 Railway 환경변수**
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

### **🚀 배포 명령어**
```bash
cd backend/services/ai-prediction
railway up
```

---

## 🗺️ **4. 경로 로직 서비스 (route-logic)**

### **📁 루트 디렉토리**
```
backend/services/route-logic
```

### **🔧 Railway 환경변수**
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

### **🚀 배포 명령어**
```bash
cd backend/services/route-logic
railway up
```

---

## 🗄️ **5. PostgreSQL 데이터베이스 서비스**

### **📁 루트 디렉토리**
```
Database Service (Railway에서 자동 생성)
```

### **🔧 자동 생성되는 환경변수**
```bash
# 모든 서비스에서 공통으로 사용
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
```

---

## 🚀 **Railway 배포 순서**

### **1단계: PostgreSQL 서비스 추가**
```bash
# Railway 대시보드에서
New Service → Database → PostgreSQL
# 자동으로 DATABASE_URL 생성됨
```

### **2단계: 각 마이크로서비스 배포**

#### **메인 API 서비스**
```bash
# 1. 프로젝트 생성
railway init

# 2. 루트 디렉토리 설정
# Railway 대시보드 → Settings → Root Directory: backend/cleanair-route

# 3. 환경변수 설정
# Railway 대시보드 → Variables 탭에서 위의 환경변수들 설정

# 4. 배포
railway up
```

#### **데이터 수집 서비스**
```bash
# 1. 새 프로젝트 생성
railway init

# 2. 루트 디렉토리 설정
# Root Directory: backend/services/data-ingestion

# 3. 환경변수 설정
# Variables 탭에서 data-ingestion 환경변수들 설정

# 4. 배포
railway up
```

#### **AI 예측 서비스**
```bash
# 1. 새 프로젝트 생성
railway init

# 2. 루트 디렉토리 설정
# Root Directory: backend/services/ai-prediction

# 3. 환경변수 설정
# Variables 탭에서 ai-prediction 환경변수들 설정

# 4. 배포
railway up
```

#### **경로 로직 서비스**
```bash
# 1. 새 프로젝트 생성
railway init

# 2. 루트 디렉토리 설정
# Root Directory: backend/services/route-logic

# 3. 환경변수 설정
# Variables 탭에서 route-logic 환경변수들 설정

# 4. 배포
railway up
```

---

## 🔗 **서비스 간 통신 설정**

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

### **외부 접근 URL**
```bash
# 각 서비스의 Railway 도메인
https://cleanair-route-production.up.railway.app     # 메인 API
https://data-ingestion-production.up.railway.app     # 데이터 수집
https://ai-prediction-production.up.railway.app      # AI 예측
https://route-logic-production.up.railway.app        # 경로 로직
```

---

## 📊 **Railway 대시보드 설정**

### **각 서비스별 설정**
1. **Settings** → **Root Directory** 설정
2. **Variables** → 환경변수 설정
3. **Deployments** → 배포 상태 확인
4. **Logs** → 실시간 로그 확인

### **환경변수 설정 방법**
```bash
# Railway 대시보드 → Variables 탭에서
# Name: DATABASE_URL
# Value: postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
# Environment: Production (모든 환경에서 사용)
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

---

## 🎯 **배포 체크리스트**

### **✅ 배포 전 확인사항**
- [ ] PostgreSQL 서비스 추가 완료
- [ ] 각 서비스의 루트 디렉토리 설정
- [ ] 환경변수 설정 완료
- [ ] API 키 발급 및 설정
- [ ] CORS 설정 확인

### **✅ 배포 후 확인사항**
- [ ] 각 서비스 헬스체크 통과
- [ ] 데이터베이스 연결 확인
- [ ] 서비스 간 통신 테스트
- [ ] API 엔드포인트 테스트
- [ ] 로그 확인

**이제 각 마이크로서비스를 Railway에 성공적으로 배포할 수 있습니다!** 🎯
