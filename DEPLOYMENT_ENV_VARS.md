# 🌐 배포 환경변수 가이드

## 🚂 Railway (백엔드) 환경변수

### 📊 **데이터베이스 (자동 생성)**
```bash
# PostgreSQL 서비스 추가 시 자동 생성
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
```

### 🔑 **외부 API 키 (수동 설정)**
```bash
# 에어코리아 API (대기질 데이터)
AIRKOREA_API_KEY=your_airkorea_api_key_here

# 기상청 API (기상 데이터)
KMA_API_KEY=your_kma_api_key_here

# 카카오맵 API (지도/경로)
KAKAO_MAP_KEY=your_kakao_map_key_here
```

### 🔐 **보안 설정**
```bash
# JWT 토큰 암호화 키 (강력한 랜덤 문자열 사용)
SECRET_KEY=your-super-secret-key-change-in-production-12345

# 액세스 토큰 만료 시간 (분)
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 🌐 **CORS 설정**
```bash
# 프론트엔드 도메인 (Vercel 배포 후 업데이트)
ALLOWED_ORIGINS=https://your-frontend-app.vercel.app,http://localhost:3000
```

### 📝 **애플리케이션 설정**
```bash
# 앱 이름
APP_NAME=CleanAir Route API

# 앱 버전
APP_VERSION=1.0.0

# 디버그 모드 (프로덕션에서는 false)
DEBUG=false

# API 프리픽스
API_V1_PREFIX=/api/v1

# 로그 레벨
LOG_LEVEL=INFO
```

### 🔄 **서비스 간 통신**
```bash
# AI 예측 서비스 URL
AI_PREDICTION_SERVICE_URL=http://ai-prediction:8002

# 데이터 수집 서비스 URL
DATA_INGESTION_SERVICE_URL=http://data-ingestion:8001
```

---

## ▲ Vercel (프론트엔드) 환경변수

### 🌐 **API 엔드포인트**
```bash
# Railway 백엔드 API URL (Railway 배포 후 업데이트)
NEXT_PUBLIC_API_URL=https://your-backend-app.railway.app

# API 버전
NEXT_PUBLIC_API_VERSION=v1
```

### 🗺️ **카카오맵 설정**
```bash
# 카카오맵 JavaScript 키 (프론트엔드용)
NEXT_PUBLIC_KAKAO_MAP_KEY=your_kakao_map_javascript_key_here
```

### 🎨 **앱 설정**
```bash
# 앱 이름
NEXT_PUBLIC_APP_NAME=CleanAir Route

# 앱 버전
NEXT_PUBLIC_APP_VERSION=1.0.0

# 환경 (production, development)
NEXT_PUBLIC_ENV=production
```

### 📊 **분석 및 모니터링**
```bash
# Google Analytics (선택사항)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Sentry (에러 추적, 선택사항)
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### 🔔 **알림 설정**
```bash
# 푸시 알림 (선택사항)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key

# 이메일 서비스 (선택사항)
NEXT_PUBLIC_EMAIL_SERVICE_URL=https://your-email-service.com
```

---

## 🔧 Railway 배포 단계별 환경변수 설정

### 1️⃣ **메인 API 서비스**
```bash
# Railway 대시보드 → Variables 탭에서 설정
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
SECRET_KEY=your-super-secret-key-12345
AIRKOREA_API_KEY=your_airkorea_api_key
KMA_API_KEY=your_kma_api_key
KAKAO_MAP_KEY=your_kakao_map_key
ALLOWED_ORIGINS=https://your-frontend.vercel.app
DEBUG=false
```

### 2️⃣ **데이터 수집 서비스**
```bash
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
AIRKOREA_API_KEY=your_airkorea_api_key
KMA_API_KEY=your_kma_api_key
SERVICE_PORT=8001
LOG_LEVEL=INFO
```

### 3️⃣ **AI 예측 서비스**
```bash
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
MODEL_PATH=/app/models/model.pkl
SCALER_PATH=/app/models/scaler.pkl
SERVICE_PORT=8002
LOG_LEVEL=INFO
```

### 4️⃣ **경로 로직 서비스**
```bash
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
KAKAO_MAP_KEY=your_kakao_map_key
AI_PREDICTION_URL=http://ai-prediction:8002
DATA_INGESTION_URL=http://data-ingestion:8001
SERVICE_PORT=8003
LOG_LEVEL=INFO
```

---

## ▲ Vercel 배포 단계별 환경변수 설정

### 1️⃣ **Vercel 대시보드에서 설정**
```bash
# Settings → Environment Variables에서 설정
NEXT_PUBLIC_API_URL=https://your-backend-app.railway.app
NEXT_PUBLIC_KAKAO_MAP_KEY=your_kakao_map_javascript_key
NEXT_PUBLIC_APP_NAME=CleanAir Route
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENV=production
```

### 2️⃣ **환경별 설정**
```bash
# Production 환경
NEXT_PUBLIC_API_URL=https://your-backend-app.railway.app
NEXT_PUBLIC_ENV=production

# Preview 환경 (선택사항)
NEXT_PUBLIC_API_URL=https://your-backend-staging.railway.app
NEXT_PUBLIC_ENV=preview

# Development 환경 (로컬 개발용)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ENV=development
```

---

## 🔐 보안 체크리스트

### ✅ **Railway 보안**
- [ ] `SECRET_KEY`를 강력한 랜덤 문자열로 설정
- [ ] `DEBUG=false`로 설정
- [ ] API 키를 안전하게 보관
- [ ] `ALLOWED_ORIGINS`에 정확한 도메인만 포함

### ✅ **Vercel 보안**
- [ ] `NEXT_PUBLIC_` 접두사가 붙은 변수만 공개
- [ ] 민감한 정보는 서버사이드에서만 사용
- [ ] API 키를 환경변수로 관리

---

## 🚀 배포 순서

### 1️⃣ **Railway 백엔드 배포**
1. PostgreSQL 서비스 추가
2. 환경변수 설정
3. 메인 API 서비스 배포
4. 다른 마이크로서비스들 배포

### 2️⃣ **Vercel 프론트엔드 배포**
1. GitHub 저장소 연결
2. 환경변수 설정
3. 빌드 및 배포
4. 도메인 확인

### 3️⃣ **연동 테스트**
1. Railway API 엔드포인트 테스트
2. Vercel에서 Railway API 호출 테스트
3. 전체 기능 동작 확인

---

## 📞 API 키 발급 방법

### 🔑 **에어코리아 API**
- 사이트: https://www.airkorea.or.kr/
- 신청: 대기질 정보 API 신청

### 🌤️ **기상청 API**
- 사이트: https://data.kma.go.kr/
- 신청: 기상자료개방포털 API 신청

### 🗺️ **카카오맵 API**
- 사이트: https://developers.kakao.com/
- 신청: 카카오 개발자 계정 → 애플리케이션 등록

---

## ⚠️ 주의사항

1. **API 키 보안**: 절대 코드에 하드코딩하지 말고 환경변수 사용
2. **CORS 설정**: 정확한 프론트엔드 도메인만 허용
3. **데이터베이스**: Railway PostgreSQL은 자동으로 `DATABASE_URL` 생성
4. **도메인 업데이트**: 배포 후 실제 도메인으로 환경변수 업데이트
5. **테스트**: 각 환경에서 API 호출 테스트 필수

**이제 Railway와 Vercel에 안전하게 배포할 수 있습니다!** 🎯
