# 백엔드 명세서

## 1. 기술 스택

### 1.1 핵심 프레임워크
- **Python 3.11**: 최신 Python 기능 활용
  - 타입 힌트 지원으로 코드 안정성 향상
  - 비동기 프로그래밍 지원 (asyncio)
  - 풍부한 데이터 사이언스 생태계

- **FastAPI 0.104**: 고성능 웹 프레임워크
  - 자동 API 문서 생성 (Swagger/OpenAPI)
  - 타입 검증 및 직렬화 (Pydantic)
  - 비동기 요청 처리 지원
  - 의존성 주입 시스템

- **Pydantic 2.5**: 데이터 검증 및 직렬화
  - 런타임 타입 검증
  - JSON 스키마 자동 생성
  - 에러 메시지 자동 생성

### 1.2 데이터베이스
- **PostgreSQL 15**: 관계형 데이터베이스
  - JSON/JSONB 타입 지원
  - 시계열 데이터 최적화
  - 공간 데이터 타입 (PostGIS)
  - 고성능 인덱싱

- **SQLAlchemy 2.0**: ORM 및 데이터베이스 툴킷
  - 비동기 지원 (AsyncSession)
  - 타입 안전성
  - 마이그레이션 관리 (Alembic)

- **Redis 7.0**: 인메모리 데이터 스토어
  - 캐싱 및 세션 관리
  - 실시간 데이터 스트리밍
  - 분산 락 구현

### 1.3 개발 및 운영 도구
- **Docker & Docker Compose**: 컨테이너화
- **Poetry**: 의존성 관리
- **Black + isort**: 코드 포맷팅
- **pytest**: 테스팅 프레임워크
- **pre-commit**: Git 훅 관리

## 2. 마이크로서비스 아키텍처 (MSA) 설계

### 2.1 서비스 분리 원칙
- **단일 책임 원칙**: 각 서비스는 하나의 명확한 책임
- **느슨한 결합**: 서비스 간 최소한의 의존성
- **높은 응집성**: 관련 기능들을 하나의 서비스에 집중
- **독립적 배포**: 각 서비스의 독립적인 배포 가능

### 2.2 Service 1: 데이터 수집 서비스 (Data Ingestion Service)

#### 2.2.1 역할과 책임
- 외부 API로부터 대기질 및 기상 데이터 수집
- 데이터 정제 및 검증
- 데이터베이스 저장 및 인덱싱
- 데이터 품질 모니터링

#### 2.2.2 기술 스택
```python
# requirements.txt
fastapi==0.104.1
httpx==0.25.2          # 비동기 HTTP 클라이언트
pandas==2.1.3          # 데이터 처리
sqlalchemy[asyncio]==2.0.23
celery==5.3.4          # 백그라운드 작업
redis==5.0.1           # 메시지 브로커
pydantic==2.5.0
```

#### 2.2.3 주요 컴포넌트
```python
# services/data_ingestion/
├── main.py                 # FastAPI 앱 진입점
├── models/
│   ├── air_quality.py     # 대기질 데이터 모델
│   ├── weather.py         # 기상 데이터 모델
│   └── base.py           # 기본 모델 클래스
├── services/
│   ├── airkorea_client.py # 에어코리아 API 클라이언트
│   ├── weather_client.py  # 기상청 API 클라이언트
│   └── data_processor.py  # 데이터 처리 로직
├── tasks/
│   ├── data_collection.py # 데이터 수집 태스크
│   └── data_validation.py # 데이터 검증 태스크
└── utils/
    ├── config.py          # 설정 관리
    └── logger.py          # 로깅 설정
```

#### 2.2.4 API 엔드포인트
```python
# 데이터 수집 서비스 API
POST /api/v1/collect/air-quality    # 대기질 데이터 수집 트리거
POST /api/v1/collect/weather        # 기상 데이터 수집 트리거
GET  /api/v1/health                 # 서비스 상태 확인
GET  /api/v1/metrics                # 수집 메트릭 조회
```

### 2.3 Service 2: AI 예측 서비스 (AI Prediction Service)

#### 2.3.1 역할과 책임
- 학습된 AI 모델 로드 및 관리
- 대기질 예측 요청 처리
- 모델 성능 모니터링
- 예측 결과 캐싱

#### 2.3.2 기술 스택
```python
# requirements.txt
fastapi==0.104.1
torch==2.1.0             # PyTorch
scikit-learn==1.3.2      # 머신러닝 라이브러리
numpy==1.25.2            # 수치 계산
pandas==2.1.3            # 데이터 처리
joblib==1.3.2            # 모델 직렬화
redis==5.0.1             # 예측 결과 캐싱
```

#### 2.3.3 주요 컴포넌트
```python
# services/ai_prediction/
├── main.py                 # FastAPI 앱 진입점
├── models/
│   ├── lstm_model.py      # LSTM 모델 클래스
│   ├── gru_model.py       # GRU 모델 클래스
│   └── ensemble_model.py  # 앙상블 모델
├── services/
│   ├── model_loader.py    # 모델 로딩 서비스
│   ├── predictor.py       # 예측 서비스
│   └── feature_engineer.py # 피처 엔지니어링
├── utils/
│   ├── preprocessing.py   # 데이터 전처리
│   └── postprocessing.py  # 후처리
└── config/
    └── model_config.py    # 모델 설정
```

#### 2.3.4 API 엔드포인트
```python
# AI 예측 서비스 API
POST /api/v1/predict/air-quality    # 대기질 예측
GET  /api/v1/models/status          # 모델 상태 조회
POST /api/v1/models/reload          # 모델 재로드
GET  /api/v1/predictions/cache      # 캐시된 예측 조회
```

### 2.4 Service 3: 경로 및 로직 서비스 (Route & Logic Service)

#### 2.4.1 역할과 책임
- API Gateway 역할
- 경로 계산 및 최적화
- 외부 지도 API 통합
- 비즈니스 로직 오케스트레이션

#### 2.4.2 기술 스택
```python
# requirements.txt
fastapi==0.104.1
httpx==0.25.2          # 내부 서비스 통신
sqlalchemy[asyncio]==2.0.23
redis==5.0.1           # 캐싱
pydantic==2.5.0
geopy==2.4.0           # 지리적 계산
networkx==3.2.1        # 그래프 알고리즘
```

#### 2.4.3 주요 컴포넌트
```python
# services/route_logic/
├── main.py                 # FastAPI 앱 진입점
├── models/
│   ├── route.py           # 경로 모델
│   ├── location.py        # 위치 모델
│   └── user.py           # 사용자 모델
├── services/
│   ├── route_calculator.py # 경로 계산 서비스
│   ├── air_quality_service.py # 대기질 서비스 통신
│   ├── map_service.py     # 지도 서비스 통합
│   └── optimization.py    # 경로 최적화
├── algorithms/
│   ├── dijkstra.py        # 최단 경로 알고리즘
│   ├── a_star.py          # A* 알고리즘
│   └── genetic.py         # 유전 알고리즘
└── utils/
    ├── distance.py        # 거리 계산
    └── time_utils.py      # 시간 유틸리티
```

#### 2.4.4 API 엔드포인트
```python
# 경로 로직 서비스 API
POST /api/v1/routes/calculate       # 경로 계산
GET  /api/v1/routes/{route_id}      # 경로 상세 조회
POST /api/v1/routes/optimize        # 경로 최적화
GET  /api/v1/locations/search       # 위치 검색
POST /api/v1/users/preferences      # 사용자 선호도 저장
```

## 3. 데이터베이스 스키마

### 3.1 핵심 테이블 설계

#### 3.1.1 air_quality_readings (대기질 측정 데이터)
```sql
CREATE TABLE air_quality_readings (
    id SERIAL PRIMARY KEY,
    station_id VARCHAR(20) NOT NULL,
    station_name VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    measured_at TIMESTAMP WITH TIME ZONE NOT NULL,
    pm25 DECIMAL(6, 2),           -- PM2.5 농도 (μg/m³)
    pm10 DECIMAL(6, 2),           -- PM10 농도 (μg/m³)
    o3 DECIMAL(6, 2),             -- 오존 농도 (ppm)
    no2 DECIMAL(6, 2),            -- 이산화질소 농도 (ppm)
    co DECIMAL(6, 2),             -- 일산화탄소 농도 (ppm)
    so2 DECIMAL(6, 2),            -- 이산화황 농도 (ppm)
    air_quality_index INTEGER,    -- 통합 대기질 지수
    grade VARCHAR(20),            -- 대기질 등급
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_air_quality_station_time ON air_quality_readings(station_id, measured_at);
CREATE INDEX idx_air_quality_location ON air_quality_readings USING GIST(ST_Point(longitude, latitude));
CREATE INDEX idx_air_quality_measured_at ON air_quality_readings(measured_at);
```

#### 3.1.2 predictions (예측 데이터)
```sql
CREATE TABLE predictions (
    id SERIAL PRIMARY KEY,
    station_id VARCHAR(20) NOT NULL,
    predicted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    prediction_horizon INTEGER NOT NULL,  -- 예측 시간 (시간 단위)
    pm25_prediction DECIMAL(6, 2),
    pm10_prediction DECIMAL(6, 2),
    o3_prediction DECIMAL(6, 2),
    no2_prediction DECIMAL(6, 2),
    confidence_score DECIMAL(4, 3),       -- 신뢰도 점수 (0-1)
    model_version VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_predictions_station_time ON predictions(station_id, predicted_at);
CREATE INDEX idx_predictions_horizon ON predictions(prediction_horizon);
```

#### 3.1.3 users (사용자 정보)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nickname VARCHAR(100),
    preferred_language VARCHAR(10) DEFAULT 'ko',
    health_conditions JSONB,              -- 건강 상태 정보
    preferences JSONB,                    -- 사용자 선호도
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- 인덱스
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

#### 3.1.4 saved_locations (저장된 위치)
```sql
CREATE TABLE saved_locations (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address TEXT,
    location_type VARCHAR(50),            -- home, work, favorite 등
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_saved_locations_user ON saved_locations(user_id);
CREATE INDEX idx_saved_locations_type ON saved_locations(location_type);
CREATE INDEX idx_saved_locations_location ON saved_locations USING GIST(ST_Point(longitude, latitude));
```

#### 3.1.5 route_history (경로 이력)
```sql
CREATE TABLE route_history (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_latitude DECIMAL(10, 8) NOT NULL,
    start_longitude DECIMAL(11, 8) NOT NULL,
    end_latitude DECIMAL(10, 8) NOT NULL,
    end_longitude DECIMAL(11, 8) NOT NULL,
    route_type VARCHAR(20) NOT NULL,      -- fastest, shortest, healthiest
    total_distance DECIMAL(8, 2),         -- 총 거리 (km)
    total_duration INTEGER,               -- 총 소요시간 (분)
    air_quality_score DECIMAL(5, 2),      -- 대기질 점수
    waypoints JSONB,                      -- 경유지 정보
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_route_history_user ON route_history(user_id);
CREATE INDEX idx_route_history_created_at ON route_history(created_at);
CREATE INDEX idx_route_history_route_type ON route_history(route_type);
```

### 3.2 데이터베이스 연결 및 설정

#### 3.2.1 연결 풀 설정
```python
# database/config.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql+asyncpg://user:password@localhost:5432/cleanair_route"
)

engine = create_async_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=30,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False
)

AsyncSessionLocal = sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)
```

#### 3.2.2 의존성 주입
```python
# database/dependencies.py
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from .config import AsyncSessionLocal

async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
```

## 4. 서비스 간 통신

### 4.1 HTTP 기반 통신
```python
# utils/http_client.py
import httpx
from typing import Dict, Any

class ServiceClient:
    def __init__(self, base_url: str, timeout: int = 30):
        self.base_url = base_url
        self.timeout = timeout
    
    async def get(self, endpoint: str, params: Dict[str, Any] = None):
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(f"{self.base_url}{endpoint}", params=params)
            response.raise_for_status()
            return response.json()
    
    async def post(self, endpoint: str, data: Dict[str, Any]):
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(f"{self.base_url}{endpoint}", json=data)
            response.raise_for_status()
            return response.json()
```

### 4.2 서비스 디스커버리
```python
# utils/service_registry.py
from typing import Dict
import os

class ServiceRegistry:
    def __init__(self):
        self.services = {
            "data-ingestion": os.getenv("DATA_INGESTION_URL", "http://localhost:8001"),
            "ai-prediction": os.getenv("AI_PREDICTION_URL", "http://localhost:8002"),
            "route-logic": os.getenv("ROUTE_LOGIC_URL", "http://localhost:8003"),
        }
    
    def get_service_url(self, service_name: str) -> str:
        return self.services.get(service_name)
```

### 4.3 에러 처리 및 재시도
```python
# utils/retry.py
import asyncio
from functools import wraps
from typing import Callable, Any

def retry(max_attempts: int = 3, delay: float = 1.0):
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> Any:
            for attempt in range(max_attempts):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts - 1:
                        raise e
                    await asyncio.sleep(delay * (2 ** attempt))
            return None
        return wrapper
    return decorator
```

## 5. 보안 및 인증

### 5.1 JWT 토큰 기반 인증
```python
# auth/jwt_handler.py
from datetime import datetime, timedelta
from typing import Optional
import jwt
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class JWTHandler:
    def __init__(self, secret_key: str, algorithm: str = "HS256"):
        self.secret_key = secret_key
        self.algorithm = algorithm
    
    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def verify_token(self, token: str):
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.PyJWTError:
            return None
```

### 5.2 API 키 관리
```python
# auth/api_key.py
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

class APIKeyManager:
    def __init__(self, valid_keys: set):
        self.valid_keys = valid_keys
    
    def validate_api_key(self, credentials: HTTPAuthorizationCredentials = Depends(security)):
        if credentials.credentials not in self.valid_keys:
            raise HTTPException(status_code=401, detail="Invalid API key")
        return credentials.credentials
```

이 백엔드 명세서는 확장 가능하고 안정적인 마이크로서비스 아키텍처를 기반으로 한 대기질 예측 및 경로 추천 서비스의 기술적 구현 방안을 제시합니다.
