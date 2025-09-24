# 프로젝트 폴더 구조

## 전체 프로젝트 구조

```
weather/
├── README.md                           # 프로젝트 개요 및 빠른 시작 가이드
├── docker-compose.yml                  # 로컬 개발 환경 Docker 설정
├── .env.example                        # 환경 변수 예시 파일
├── .gitignore                          # Git 무시 파일 목록
│
├── docs/                               # 프로젝트 문서
│   ├── frontend-specification.md       # 프론트엔드 명세서
│   ├── backend-specification.md        # 백엔드 명세서
│   ├── ai-modeling-specification.md    # AI 모델링 명세서
│   ├── infrastructure-deployment.md    # 인프라 및 배포 전략
│   ├── system-architecture.md          # 시스템 아키텍처 다이어그램
│   ├── development-roadmap.md          # 개발 로드맵
│   ├── api-specification.md            # API 명세서
│   └── project-structure.md            # 프로젝트 구조 (현재 파일)
│
├── frontend/                           # Next.js 프론트엔드
│   ├── package.json                    # Node.js 의존성 및 스크립트
│   ├── next.config.js                  # Next.js 설정
│   ├── tailwind.config.js              # Tailwind CSS 설정
│   ├── tsconfig.json                   # TypeScript 설정
│   ├── public/                         # 정적 파일
│   │   ├── icons/                      # 아이콘 파일들
│   │   │   ├── start-marker.png        # 출발지 마커
│   │   │   └── end-marker.png          # 도착지 마커
│   │   └── images/                     # 이미지 파일들
│   └── src/                            # 소스 코드
│       ├── app/                        # Next.js 14 App Router
│       │   ├── layout.tsx              # 루트 레이아웃
│       │   ├── page.tsx                # 홈페이지
│       │   ├── routes/                 # 경로 검색 페이지
│       │   │   └── page.tsx
│       │   └── api/                    # API Routes
│       │       └── health/             # 헬스체크 API
│       │           └── route.ts
│       ├── components/                 # 재사용 가능한 컴포넌트
│       │   ├── ui/                     # 기본 UI 컴포넌트
│       │   │   ├── Button.tsx
│       │   │   ├── Input.tsx
│       │   │   └── Modal.tsx
│       │   ├── map/                    # 지도 관련 컴포넌트
│       │   │   ├── MainMap.tsx         # 메인 지도 컴포넌트
│       │   │   ├── RouteMap.tsx        # 경로 표시 지도
│       │   │   └── HeatmapLayer.tsx    # 히트맵 레이어
│       │   ├── charts/                 # 차트 컴포넌트
│       │   │   ├── AirQualityChart.tsx # 대기질 차트
│       │   │   └── RouteComparison.tsx # 경로 비교 차트
│       │   └── layout/                 # 레이아웃 컴포넌트
│       │       ├── Header.tsx
│       │       ├── Sidebar.tsx
│       │       └── Footer.tsx
│       ├── services/                   # API 서비스
│       │   ├── api.ts                  # API 클라이언트 (작성 완료)
│       │   ├── auth.ts                 # 인증 서비스
│       │   └── storage.ts              # 로컬 스토리지 서비스
│       ├── hooks/                      # 커스텀 훅
│       │   ├── useMap.ts               # 지도 관련 훅
│       │   ├── useRoute.ts             # 경로 관련 훅
│       │   └── useAirQuality.ts        # 대기질 관련 훅
│       ├── store/                      # 상태 관리
│       │   ├── routeStore.ts           # 경로 상태
│       │   ├── mapStore.ts             # 지도 상태
│       │   └── userStore.ts            # 사용자 상태
│       ├── utils/                      # 유틸리티 함수
│       │   ├── constants.ts            # 상수 정의
│       │   ├── helpers.ts              # 헬퍼 함수
│       │   └── validation.ts           # 유효성 검사
│       └── types/                      # TypeScript 타입 정의
│           ├── api.ts                  # API 타입
│           ├── map.ts                  # 지도 타입
│           └── route.ts                # 경로 타입
│
├── backend/                            # FastAPI 백엔드
│   ├── requirements.txt                # Python 의존성
│   ├── .env.example                    # 환경 변수 예시
│   └── services/                       # 마이크로서비스
│       ├── data-ingestion/             # 데이터 수집 서비스
│       │   ├── main.py                 # FastAPI 앱 (작성 완료)
│       │   ├── requirements.txt        # 서비스별 의존성
│       │   ├── Dockerfile              # Docker 설정
│       │   ├── models/                 # 데이터 모델
│       │   │   ├── air_quality.py      # 대기질 모델
│       │   │   └── weather.py          # 기상 모델
│       │   ├── services/               # 비즈니스 로직
│       │   │   ├── airkorea_client.py  # 에어코리아 API 클라이언트
│       │   │   ├── weather_client.py   # 기상청 API 클라이언트
│       │   │   └── data_processor.py   # 데이터 처리
│       │   └── utils/                  # 유틸리티
│       │       ├── config.py           # 설정 관리
│       │       └── logger.py           # 로깅 설정
│       │
│       ├── ai-prediction/              # AI 예측 서비스
│       │   ├── main.py                 # FastAPI 앱 (작성 완료)
│       │   ├── requirements.txt        # 서비스별 의존성
│       │   ├── Dockerfile              # Docker 설정
│       │   ├── models/                 # AI 모델
│       │   │   ├── lstm_model.py       # LSTM 모델
│       │   │   └── ensemble_model.py   # 앙상블 모델
│       │   ├── services/               # 예측 서비스
│       │   │   ├── model_loader.py     # 모델 로딩
│       │   │   ├── predictor.py        # 예측 로직
│       │   │   └── feature_engineer.py # 피처 엔지니어링
│       │   └── utils/                  # 유틸리티
│       │       ├── preprocessing.py    # 전처리
│       │       └── postprocessing.py   # 후처리
│       │
│       └── route-logic/                # 경로 로직 서비스
│           ├── main.py                 # FastAPI 앱 (작성 완료)
│           ├── requirements.txt        # 서비스별 의존성
│           ├── Dockerfile              # Docker 설정
│           ├── models/                 # 데이터 모델
│           │   ├── route.py            # 경로 모델
│           │   ├── location.py         # 위치 모델
│           │   └── user.py             # 사용자 모델
│           ├── services/               # 비즈니스 로직
│           │   ├── route_calculator.py # 경로 계산
│           │   ├── map_service.py      # 지도 서비스
│           │   └── optimization.py     # 최적화
│           ├── algorithms/             # 알고리즘
│           │   ├── dijkstra.py         # 다익스트라
│           │   ├── a_star.py           # A* 알고리즘
│           │   └── genetic.py          # 유전 알고리즘
│           └── utils/                  # 유틸리티
│               ├── distance.py         # 거리 계산
│               └── time_utils.py       # 시간 유틸리티
│
├── ai-models/                          # AI 모델 및 학습
│   ├── train_model.py                  # 모델 학습 스크립트 (작성 완료)
│   ├── requirements.txt                # 학습용 의존성
│   ├── data/                           # 학습 데이터
│   │   ├── raw/                        # 원시 데이터
│   │   ├── processed/                  # 전처리된 데이터
│   │   └── air_quality_data.csv        # 대기질 데이터 (예시)
│   ├── models/                         # 학습된 모델
│   │   ├── model.h5                    # TensorFlow 모델
│   │   ├── model.pkl                   # Pickle 모델
│   │   └── scaler.pkl                  # 스케일러
│   ├── notebooks/                      # Jupyter 노트북
│   │   ├── data_exploration.ipynb      # 데이터 탐색
│   │   ├── model_development.ipynb     # 모델 개발
│   │   └── evaluation.ipynb            # 모델 평가
│   └── scripts/                        # 학습 스크립트
│       ├── data_collection.py          # 데이터 수집
│       ├── preprocessing.py            # 전처리
│       └── evaluation.py               # 평가
│
├── scripts/                            # 프로젝트 스크립트
│   ├── setup.sh                        # 프로젝트 설정
│   ├── build.sh                        # 빌드 스크립트
│   ├── deploy.sh                       # 배포 스크립트
│   └── test.sh                         # 테스트 스크립트
│
├── tests/                              # 테스트 코드
│   ├── frontend/                       # 프론트엔드 테스트
│   │   ├── components/                 # 컴포넌트 테스트
│   │   ├── services/                   # 서비스 테스트
│   │   └── utils/                      # 유틸리티 테스트
│   ├── backend/                        # 백엔드 테스트
│   │   ├── data-ingestion/             # 데이터 수집 테스트
│   │   ├── ai-prediction/              # AI 예측 테스트
│   │   └── route-logic/                # 경로 로직 테스트
│   └── integration/                    # 통합 테스트
│       ├── api/                        # API 테스트
│       └── e2e/                        # E2E 테스트
│
├── .github/                            # GitHub 설정
│   └── workflows/                      # GitHub Actions
│       ├── deploy.yml                  # 배포 워크플로우
│       ├── test.yml                    # 테스트 워크플로우
│       └── build.yml                   # 빌드 워크플로우
│
└── infrastructure/                     # 인프라 설정
    ├── docker/                         # Docker 설정
    │   ├── nginx.conf                  # Nginx 설정
    │   └── postgres/                   # PostgreSQL 설정
    │       └── init.sql                # 초기화 SQL
    ├── k8s/                            # Kubernetes 설정
    │   ├── namespace.yaml
    │   ├── configmap.yaml
    │   └── deployments/                # 배포 설정
    └── terraform/                      # Terraform 설정
        ├── main.tf
        ├── variables.tf
        └── outputs.tf
```

## 주요 파일 설명

### 1. 루트 레벨 파일
- **README.md**: 프로젝트 개요, 설치 방법, 사용법
- **docker-compose.yml**: 로컬 개발 환경을 위한 Docker Compose 설정
- **.env.example**: 환경 변수 예시 파일

### 2. 문서 (docs/)
- **frontend-specification.md**: 프론트엔드 기술 스택, UI/UX 설계
- **backend-specification.md**: 백엔드 MSA 아키텍처, 데이터베이스 설계
- **ai-modeling-specification.md**: AI 모델 설계, 학습 파이프라인
- **infrastructure-deployment.md**: 클라우드 배포, CI/CD 전략
- **system-architecture.md**: 전체 시스템 아키텍처 다이어그램
- **development-roadmap.md**: 6개월 개발 계획
- **api-specification.md**: RESTful API 엔드포인트 명세

### 3. 프론트엔드 (frontend/)
- **Next.js 14** 기반의 React 애플리케이션
- **TypeScript**로 타입 안전성 보장
- **Tailwind CSS**로 스타일링
- **Kakao Maps SDK**로 지도 기능
- **SWR**로 데이터 페칭 및 캐싱

### 4. 백엔드 (backend/services/)
- **3개의 마이크로서비스**로 구성
- **FastAPI** 기반의 비동기 API 서버
- **PostgreSQL** 데이터베이스
- **Redis** 캐싱 및 세션 관리

### 5. AI 모델 (ai-models/)
- **TensorFlow/Keras** 기반 LSTM 모델
- **scikit-learn**으로 데이터 전처리
- **Jupyter 노트북**으로 모델 개발 및 실험

### 6. 테스트 (tests/)
- **단위 테스트**: 각 컴포넌트/서비스별 테스트
- **통합 테스트**: API 엔드포인트 테스트
- **E2E 테스트**: 전체 사용자 플로우 테스트

### 7. 인프라 (infrastructure/)
- **Docker**: 컨테이너화
- **Kubernetes**: 오케스트레이션 (선택사항)
- **Terraform**: 인프라 코드화 (선택사항)

## 개발 환경 설정

### 1. 필수 요구사항
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### 2. 환경 변수 설정
```bash
# .env 파일 생성
cp .env.example .env

# 필요한 환경 변수 설정
DATABASE_URL=postgresql://user:password@localhost:5432/cleanair_route
REDIS_URL=redis://localhost:6379
AIRKOREA_API_KEY=your_airkorea_api_key
KMA_API_KEY=your_kma_api_key
KAKAO_MAP_KEY=your_kakao_map_key
```

### 3. 로컬 개발 환경 실행
```bash
# Docker Compose로 전체 서비스 실행
docker-compose up -d

# 또는 개별 서비스 실행
cd frontend && npm install && npm run dev
cd backend/services/data-ingestion && pip install -r requirements.txt && python main.py
cd backend/services/ai-prediction && pip install -r requirements.txt && python main.py
cd backend/services/route-logic && pip install -r requirements.txt && python main.py
```

이 프로젝트 구조는 확장 가능하고 유지보수가 용이한 마이크로서비스 아키텍처를 기반으로 설계되었습니다.
