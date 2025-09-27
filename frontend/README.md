# CleanAir Route Frontend

대기질을 고려한 최적의 이동 경로를 추천하는 웹 애플리케이션의 프론트엔드입니다.

## 🚀 기술 스택

- **Next.js 14** - App Router 기반 React 프레임워크
- **React 18** - 최신 React 기능 활용
- **TypeScript 5.0** - 타입 안전성 보장
- **Tailwind CSS 3.4** - 유틸리티 퍼스트 CSS 프레임워크
- **Kakao Maps SDK** - 한국 지도 서비스
- **Zustand** - 경량 상태 관리
- **SWR** - 데이터 페칭 및 캐싱
- **Chart.js** - 데이터 시각화
- **Framer Motion** - 애니메이션

## 📁 프로젝트 구조 (아토믹 디자인 패턴)

```
frontend/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── layout.tsx         # 루트 레이아웃
│   │   ├── page.tsx           # 홈페이지
│   │   └── globals.css        # 전역 스타일
│   ├── components/            # 아토믹 디자인 컴포넌트
│   │   ├── atoms/            # 기본 UI 요소 (Button, Input, Icon 등)
│   │   │   ├── Button/       # 버튼 컴포넌트
│   │   │   ├── Input/        # 입력 필드 컴포넌트
│   │   │   ├── Icon/         # 아이콘 컴포넌트
│   │   │   ├── Spinner/      # 로딩 스피너
│   │   │   ├── Badge/        # 배지 컴포넌트
│   │   │   └── index.ts      # Atoms 통합 export
│   │   ├── molecules/        # 조합된 UI 요소 (SearchForm, Card 등)
│   │   │   ├── SearchForm/   # 검색 폼
│   │   │   ├── Card/         # 카드 컴포넌트
│   │   │   ├── AirQualityCard/ # 대기질 카드
│   │   │   ├── RouteCard/    # 경로 카드
│   │   │   └── index.ts      # Molecules 통합 export
│   │   ├── organisms/        # 복합 UI 블록 (Header, Map, Sidebar 등)
│   │   │   ├── Header/       # 헤더 컴포넌트
│   │   │   ├── Map/          # 지도 컴포넌트
│   │   │   ├── Sidebar/      # 사이드바 컴포넌트
│   │   │   ├── Footer/       # 푸터 컴포넌트
│   │   │   └── index.ts      # Organisms 통합 export
│   │   └── templates/        # 페이지 레이아웃 템플릿
│   │       ├── MainLayout/   # 메인 레이아웃
│   │       ├── MapLayout/    # 지도 레이아웃
│   │       └── index.ts      # Templates 통합 export
│   ├── hooks/                # 커스텀 훅
│   ├── store/                # Zustand 상태 관리
│   ├── services/             # API 서비스
│   ├── utils/                # 유틸리티 함수
│   └── types/                # TypeScript 타입 정의
├── public/                   # 정적 파일
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

## 🛠️ 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
# Kakao Maps API Key
NEXT_PUBLIC_KAKAO_MAP_KEY=your_kakao_map_api_key_here

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8003

# Environment
NODE_ENV=development
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 🧩 아토믹 디자인 패턴

이 프로젝트는 **아토믹 디자인 패턴**을 적용하여 체계적이고 확장 가능한 컴포넌트 구조를 구현했습니다.

### 📊 아토믹 디자인 계층 구조

```
Pages (페이지)
    ↓
Templates (템플릿)
    ↓
Organisms (유기체)
    ↓
Molecules (분자)
    ↓
Atoms (원자)
```

### 🔬 각 계층별 역할

#### **Atoms (원자)**
- 가장 기본적인 UI 요소
- 재사용 가능한 최소 단위 컴포넌트
- 예: Button, Input, Icon, Spinner, Badge

#### **Molecules (분자)**
- Atoms를 조합한 단순한 UI 그룹
- 특정 기능을 수행하는 컴포넌트
- 예: SearchForm, Card, AirQualityCard, RouteCard

#### **Organisms (유기체)**
- Molecules와 Atoms를 조합한 복합 UI 블록
- 페이지의 독립적인 섹션을 구성
- 예: Header, Map, Sidebar, Footer

#### **Templates (템플릿)**
- Organisms를 배치하는 페이지 레이아웃
- 콘텐츠가 없는 구조적 프레임워크
- 예: MainLayout, MapLayout

#### **Pages (페이지)**
- Templates에 실제 콘텐츠를 채운 최종 결과물
- 사용자가 실제로 보는 화면

### 🎯 아토믹 디자인의 장점

1. **재사용성**: 컴포넌트의 체계적인 재사용
2. **일관성**: 디자인 시스템의 일관된 적용
3. **확장성**: 새로운 컴포넌트 추가가 용이
4. **유지보수성**: 명확한 구조로 유지보수 효율성 증대
5. **협업**: 팀원 간 명확한 컴포넌트 역할 분담

## 🎯 주요 기능

### 1. 지도 기반 경로 검색
- Kakao Maps SDK를 활용한 인터랙티브 지도
- 출발지/도착지 검색 및 설정
- 실시간 대기질 히트맵 표시

### 2. 경로 추천 시스템
- **가장 빠른 경로**: 최단 시간 경로
- **가장 짧은 경로**: 최단 거리 경로  
- **가장 건강한 경로**: 대기질을 고려한 경로

### 3. 대기질 정보
- 실시간 대기질 데이터 표시
- PM2.5, PM10, O3, NO2 등 오염물질 정보
- 대기질 등급별 건강 권고사항

### 4. 데이터 시각화
- 경로별 대기질 점수 비교
- 시간대별 대기질 변화 차트
- 오염물질 노출량 분석

## 🎨 UI/UX 특징

### 1. 반응형 디자인
- 모바일 우선 접근법
- 터치 친화적 인터페이스
- 다양한 화면 크기 지원

### 2. 접근성 (A11y)
- WCAG 2.1 AA 준수
- 키보드 네비게이션 지원
- 스크린 리더 호환성

### 3. 사용자 경험
- 직관적인 색상 시스템
- 부드러운 애니메이션
- 즉각적인 피드백

## 🔧 개발 도구

### 코드 품질
- **ESLint** - 코드 린팅
- **Prettier** - 코드 포맷팅
- **TypeScript** - 타입 체크

### 테스팅
- **Jest** - 단위 테스트
- **Testing Library** - 컴포넌트 테스트

### 빌드 및 배포
- **Next.js** - 자동 코드 분할
- **Vercel** - 프로덕션 배포

## 📱 주요 컴포넌트

### 1. MainMap
- Kakao Maps SDK 연동
- 대기질 히트맵 표시
- 경로 시각화

### 2. RouteSearchForm
- 출발지/도착지 입력
- 주소 검색 (지오코딩)
- 현재 위치 설정

### 3. RouteComparison
- 경로별 상세 정보 비교
- 대기질 점수 시각화
- 경로 선택 기능

### 4. AirQualityCard
- 실시간 대기질 정보
- 오염물질 상세 데이터
- 건강 권고사항

## 🚀 배포

### Vercel 배포

1. Vercel 계정에 GitHub 저장소 연결
2. 환경 변수 설정
3. 자동 배포 활성화

### 환경 변수 (프로덕션)
```env
NEXT_PUBLIC_KAKAO_MAP_KEY=your_production_kakao_map_key
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NODE_ENV=production
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

- 이메일: contact@cleanairroute.com
- 웹사이트: https://cleanairroute.com
- GitHub: https://github.com/cleanairroute/frontend
