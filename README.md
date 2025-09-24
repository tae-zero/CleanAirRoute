# 클린에어 루트 (CleanAir Route) - 종합 기술 기획서

## 📋 프로젝트 개요

### 프로젝트 명
**클린에어 루트 (CleanAir Route)**

### 비전
도시 거주민들이 일상 속에서 대기오염 노출을 최소화하고, 데이터에 기반한 건강한 선택을 할 수 있도록 돕는 개인 맞춤형 환경 내비게이션 서비스 제공

### 핵심 기능
- AI 기반 시계열 예측 모델을 통한 최대 72시간 후의 지역별 대기질 예측
- 예측된 대기질 데이터를 지도 위에 직관적으로 시각화
- 시간, 거리, 대기질을 종합적으로 고려한 '최적의 건강 경로' 추천

### 기술 아키텍처
프론트엔드(Next.js on Vercel)와 백엔드(FastAPI on Railway)가 분리된 MSA(마이크로서비스 아키텍처) 기반의 클라우드 네이티브 애플리케이션

## 📁 문서 구조

이 프로젝트의 상세 기획서는 다음 문서들로 구성됩니다:

1. **[프론트엔드 명세서](./docs/frontend-specification.md)** - Next.js 기반 프론트엔드 설계
2. **[백엔드 명세서](./docs/backend-specification.md)** - FastAPI 기반 마이크로서비스 아키텍처
3. **[AI 모델링 명세서](./docs/ai-modeling-specification.md)** - 대기질 예측 모델 설계
4. **[인프라 및 배포 전략](./docs/infrastructure-deployment.md)** - 클라우드 배포 및 CI/CD
5. **[시스템 아키텍처](./docs/system-architecture.md)** - 전체 시스템 설계 다이어그램
6. **[개발 로드맵](./docs/development-roadmap.md)** - 단계별 개발 계획
7. **[API 명세서](./docs/api-specification.md)** - RESTful API 엔드포인트 정의

## 🚀 빠른 시작

### 개발 환경 설정
```bash
# 프로젝트 클론
git clone <repository-url>
cd weather

# 프론트엔드 설정
cd frontend
npm install
npm run dev

# 백엔드 설정
cd ../backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 주요 기술 스택
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Python 3.11, FastAPI, PostgreSQL, Docker
- **AI/ML**: PyTorch, scikit-learn, pandas, numpy
- **Infrastructure**: Vercel, Railway, GitHub Actions
- **Maps**: Kakao Maps SDK, OpenStreetMap

## 📊 프로젝트 구조

```
weather/
├── frontend/                 # Next.js 프론트엔드
│   ├── src/
│   │   ├── components/      # 재사용 가능한 컴포넌트
│   │   ├── pages/          # 페이지 컴포넌트
│   │   ├── hooks/          # 커스텀 훅
│   │   ├── store/          # 상태 관리
│   │   └── utils/          # 유틸리티 함수
│   ├── public/             # 정적 파일
│   └── package.json
├── backend/                 # FastAPI 백엔드
│   ├── services/           # 마이크로서비스
│   │   ├── data-ingestion/ # 데이터 수집 서비스
│   │   ├── ai-prediction/  # AI 예측 서비스
│   │   └── route-logic/    # 경로 로직 서비스
│   ├── shared/             # 공통 모듈
│   └── requirements.txt
├── ai-models/              # AI 모델 및 학습 코드
│   ├── data/              # 학습 데이터
│   ├── models/            # 학습된 모델
│   └── notebooks/         # Jupyter 노트북
├── docs/                  # 프로젝트 문서
└── docker-compose.yml     # 로컬 개발 환경
```

## 🎯 핵심 목표

1. **정확한 예측**: 서울시 행정구역별 PM2.5 농도를 72시간 후까지 예측 (MAE 10% 이내)
2. **직관적 UI**: 대기질 데이터를 지도와 차트로 직관적으로 시각화
3. **스마트 경로**: 시간, 거리, 대기질을 종합한 최적 경로 추천
4. **확장성**: 마이크로서비스 아키텍처로 향후 기능 확장 용이
5. **안정성**: 클라우드 네이티브 설계로 고가용성 보장

## 📈 성공 지표

- **예측 정확도**: MAE < 10%, R² > 0.85
- **응답 시간**: API 응답 < 2초, 페이지 로딩 < 3초
- **사용자 만족도**: 경로 추천 정확도 > 80%
- **시스템 가용성**: 99.9% 업타임

## 🤝 기여 가이드

1. 이슈 생성 또는 기존 이슈 확인
2. 기능 브랜치 생성 (`feature/기능명`)
3. 코드 작성 및 테스트
4. Pull Request 생성
5. 코드 리뷰 및 머지

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 생성해 주세요.

---

**개발팀**: 수석 솔루션 아키텍트  
**최종 업데이트**: 2024년 12월
