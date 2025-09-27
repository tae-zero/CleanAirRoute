# 🚂 Railway 배포 가이드

## 📋 Railway PostgreSQL 연동 완료!

현재 코드는 **Railway의 내장 PostgreSQL**을 완벽하게 지원합니다.

## 🔧 Railway 배포 단계

### 1. **Railway 프로젝트 생성**
```bash
# Railway CLI 설치
npm install -g @railway/cli

# 로그인
railway login

# 프로젝트 생성
railway init
```

### 2. **PostgreSQL 서비스 추가**
Railway 대시보드에서:
1. **New Service** → **Database** → **PostgreSQL** 선택
2. 자동으로 `DATABASE_URL` 환경 변수 생성됨

### 3. **환경 변수 설정**
Railway 대시보드의 **Variables** 탭에서 설정:

```bash
# 자동 생성됨 (PostgreSQL 서비스 추가 시)
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway

# 수동 설정 필요
SECRET_KEY=your-secret-key-here
AIRKOREA_API_KEY=your_airkorea_api_key
KMA_API_KEY=your_kma_api_key
KAKAO_MAP_KEY=your_kakao_map_key
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

### 4. **배포 실행**
```bash
# 메인 API 서비스 배포
cd backend/cleanair-route
railway up

# 또는 GitHub 연동으로 자동 배포
railway connect
```

## 🗄️ 데이터베이스 초기화

### 자동 초기화
애플리케이션 시작 시 자동으로 테이블이 생성됩니다:

```python
# main.py의 lifespan 함수에서
Base.metadata.create_all(bind=engine)
```

### 수동 초기화 (필요 시)
```bash
# Railway CLI로 데이터베이스 접속
railway connect postgres

# SQL 스크립트 실행
psql -f backend/init.sql
```

## 🔄 서비스별 배포

### 1. **메인 API 서비스** (포트 8000)
```bash
cd backend/cleanair-route
railway up
```

### 2. **데이터 수집 서비스** (포트 8001)
```bash
cd backend/services/data-ingestion
railway up
```

### 3. **AI 예측 서비스** (포트 8002)
```bash
cd backend/services/ai-prediction
railway up
```

### 4. **경로 로직 서비스** (포트 8003)
```bash
cd backend/services/route-logic
railway up
```

## 🌐 도메인 설정

Railway에서 자동 생성되는 도메인:
- `https://your-project-name-production.up.railway.app`

## 📊 모니터링

Railway 대시보드에서 확인 가능:
- **Logs**: 실시간 로그 확인
- **Metrics**: CPU, 메모리 사용량
- **Database**: PostgreSQL 연결 상태
- **Deployments**: 배포 이력

## 🔧 문제 해결

### 데이터베이스 연결 오류
```bash
# 연결 테스트
railway run python -c "
import os
from sqlalchemy import create_engine
engine = create_engine(os.getenv('DATABASE_URL'))
print('Database connection successful!')
"
```

### 환경 변수 확인
```bash
# 모든 환경 변수 확인
railway variables
```

## ✅ 완성된 기능들

- ✅ **PostgreSQL 자동 연결**
- ✅ **환경 변수 기반 설정**
- ✅ **자동 테이블 생성**
- ✅ **Railway 최적화된 Dockerfile**
- ✅ **헬스체크 엔드포인트**
- ✅ **CORS 설정**
- ✅ **로깅 시스템**

## 🚀 배포 후 확인

1. **헬스체크**: `GET /health`
2. **API 문서**: `GET /docs`
3. **데이터베이스**: 테이블 생성 확인
4. **로그**: Railway 대시보드에서 확인

**Railway PostgreSQL과 완벽하게 호환되는 코드가 준비되었습니다!** 🎯
