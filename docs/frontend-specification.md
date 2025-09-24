# 프론트엔드 명세서

## 1. 기술 스택

### 1.1 핵심 프레임워크
- **Next.js 14**: App Router 기반의 풀스택 React 프레임워크
  - 서버사이드 렌더링(SSR) 및 정적 사이트 생성(SSG) 지원
  - API Routes를 통한 백엔드 통신 최적화
  - 자동 코드 분할 및 성능 최적화

- **React 18**: 최신 React 기능 활용
  - Concurrent Features (Suspense, Error Boundaries)
  - Server Components 지원
  - 향상된 성능과 사용자 경험

- **TypeScript 5.0**: 타입 안전성 보장
  - 컴파일 타임 에러 방지
  - 향상된 개발자 경험 및 코드 품질
  - API 응답 타입 정의

### 1.2 스타일링 및 UI
- **Tailwind CSS 3.4**: 유틸리티 퍼스트 CSS 프레임워크
  - 빠른 프로토타이핑 및 일관된 디자인 시스템
  - 반응형 디자인 지원
  - 다크모드 지원

- **Headless UI**: 접근성을 고려한 UI 컴포넌트
  - 키보드 네비게이션 지원
  - 스크린 리더 호환성
  - WAI-ARIA 가이드라인 준수

- **Framer Motion**: 고성능 애니메이션 라이브러리
  - 지도 인터랙션 애니메이션
  - 페이지 전환 효과
  - 데이터 시각화 애니메이션

### 1.3 상태 관리
- **Zustand**: 경량 상태 관리 라이브러리
  - 간단한 API와 낮은 보일러플레이트
  - TypeScript 완벽 지원
  - 미들웨어 지원 (persist, devtools)

### 1.4 지도 및 시각화
- **Kakao Maps SDK**: 한국 지도 서비스
  - 정확한 한국 지도 데이터
  - 커스텀 마커 및 오버레이 지원
  - 모바일 최적화

- **Chart.js**: 데이터 시각화
  - 반응형 차트 지원
  - 다양한 차트 타입 (라인, 바, 도넛)
  - 애니메이션 효과

- **React-Leaflet**: 오픈소스 지도 라이브러리
  - 대체 지도 옵션 제공
  - 커스텀 타일 레이어 지원
  - 무료 사용 가능

### 1.5 개발 도구
- **ESLint + Prettier**: 코드 품질 관리
- **Husky + lint-staged**: Git 훅 설정
- **Jest + Testing Library**: 테스팅 프레임워크
- **Storybook**: 컴포넌트 문서화

## 2. 주요 화면 및 기능 설계

### 2.1 메인 대시보드

#### 2.1.1 대기질 히트맵
```typescript
interface AirQualityHeatmap {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  heatmapData: {
    lat: number;
    lng: number;
    intensity: number; // PM2.5 농도
    timestamp: string;
  }[];
  colorScale: {
    good: string;      // #00E400 (0-15)
    moderate: string;  // #FFFF00 (16-35)
    unhealthy: string; // #FF7E00 (36-75)
    veryUnhealthy: string; // #FF0000 (76-150)
    hazardous: string; // #8F3F97 (151+)
  };
}
```

**구현 특징:**
- 실시간 대기질 데이터를 색상 그라데이션으로 표시
- 마우스 호버 시 상세 정보 툴팁 표시
- 시간대별 슬라이더로 과거/미래 데이터 탐색
- 반응형 디자인으로 모바일 최적화

#### 2.1.2 타임라인 슬라이더
```typescript
interface TimelineSlider {
  currentTime: Date;
  timeRange: {
    start: Date;
    end: Date;
  };
  interval: '1h' | '3h' | '6h' | '12h' | '24h';
  onTimeChange: (time: Date) => void;
}
```

**기능:**
- 72시간 예측 데이터 탐색
- 부드러운 애니메이션으로 시간 변화 시각화
- 키보드 접근성 지원 (화살표 키)
- 터치 제스처 지원 (모바일)

### 2.2 경로 추천 결과

#### 2.2.1 경로 비교 UI
```typescript
interface RouteComparison {
  routes: {
    id: string;
    type: 'fastest' | 'shortest' | 'healthiest';
    duration: number; // 분
    distance: number; // km
    airQualityScore: number; // 0-100
    pollutionExposure: {
      pm25: number;
      pm10: number;
      o3: number;
    };
    waypoints: Coordinate[];
  }[];
  selectedRoute: string;
}
```

**UI 구성:**
- 3개 탭으로 경로 타입 구분
- 각 경로별 핵심 지표 카드 표시
- 경로별 대기질 점수 시각화 (게이지 차트)
- 경로 선택 시 지도에 하이라이트 표시

#### 2.2.2 경로별 대기질 변화 그래프
```typescript
interface RouteAirQualityChart {
  routeId: string;
  segments: {
    distance: number;
    airQuality: {
      pm25: number;
      pm10: number;
      o3: number;
    };
    timestamp: Date;
  }[];
  chartType: 'line' | 'area' | 'bar';
}
```

**시각화 특징:**
- 경로 구간별 대기질 변화를 라인 차트로 표시
- 다중 오염물질 동시 표시 (PM2.5, PM10, O3)
- 인터랙티브 툴팁으로 상세 정보 제공
- 경로상 위험 구간 하이라이트

### 2.3 상세 정보 뷰

#### 2.3.1 시간대별 예보
```typescript
interface HourlyForecast {
  location: {
    name: string;
    coordinates: Coordinate;
  };
  forecasts: {
    timestamp: Date;
    airQuality: AirQualityData;
    weather: WeatherData;
    healthRecommendation: string;
  }[];
  summary: {
    today: string;
    tomorrow: string;
    week: string;
  };
}
```

#### 2.3.2 오염원별 수치
```typescript
interface PollutionBreakdown {
  pollutants: {
    pm25: {
      value: number;
      unit: string;
      source: string;
      healthImpact: string;
    };
    pm10: {
      value: number;
      unit: string;
      source: string;
      healthImpact: string;
    };
    o3: {
      value: number;
      unit: string;
      source: string;
      healthImpact: string;
    };
    no2: {
      value: number;
      unit: string;
      source: string;
      healthImpact: string;
    };
  };
  overallIndex: number;
  grade: 'good' | 'moderate' | 'unhealthy' | 'very_unhealthy' | 'hazardous';
}
```

#### 2.3.3 건강 행동 요령
```typescript
interface HealthRecommendations {
  currentLevel: string;
  recommendations: {
    outdoor: string[];
    indoor: string[];
    sensitive: string[]; // 민감군용
  };
  alerts: {
    type: 'warning' | 'caution' | 'info';
    message: string;
    action: string;
  }[];
}
```

## 3. 사용자 경험(UX) 원칙

### 3.1 데이터의 직관성

#### 3.1.1 색상 시스템
```css
:root {
  /* 대기질 등급별 색상 */
  --air-quality-good: #00E400;
  --air-quality-moderate: #FFFF00;
  --air-quality-unhealthy: #FF7E00;
  --air-quality-very-unhealthy: #FF0000;
  --air-quality-hazardous: #8F3F97;
  
  /* 그라데이션 */
  --gradient-healthy: linear-gradient(135deg, #00E400, #FFFF00);
  --gradient-unhealthy: linear-gradient(135deg, #FF7E00, #FF0000);
}
```

#### 3.1.2 아이콘 시스템
- 대기질 등급별 직관적 아이콘 사용
- 경로 타입별 구분되는 아이콘 (속도, 거리, 건강)
- 상태 표시를 위한 애니메이션 아이콘

#### 3.1.3 정보 계층화
- 중요도에 따른 정보 우선순위 설정
- 점진적 정보 공개 (Progressive Disclosure)
- 컨텍스트에 맞는 정보 제공

### 3.2 신뢰와 안정감

#### 3.2.1 데이터 신뢰성 표시
```typescript
interface DataReliability {
  source: string;
  lastUpdated: Date;
  confidence: number; // 0-100
  accuracy: string;
  disclaimer: string;
}
```

#### 3.2.2 로딩 상태 관리
- 스켈레톤 UI로 로딩 상태 표시
- 진행률 표시기 (Progress Bar)
- 에러 상태 처리 및 재시도 옵션

#### 3.2.3 일관된 피드백
- 모든 액션에 대한 즉각적인 피드백
- 성공/실패 상태 명확한 표시
- 사용자 액션 결과 예측 가능

### 3.3 긍정적 행동 유도

#### 3.3.1 게이미피케이션 요소
```typescript
interface Gamification {
  achievements: {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
  }[];
  streak: {
    current: number;
    best: number;
    type: 'healthy_route' | 'daily_check';
  };
  points: {
    total: number;
    thisWeek: number;
    source: string;
  };
}
```

#### 3.3.2 개인화된 추천
- 사용자 행동 패턴 분석
- 개인별 맞춤 경로 추천
- 건강 목표 설정 및 추적

#### 3.3.3 사회적 연결
- 친구와 경로 공유 기능
- 지역 커뮤니티 대기질 정보
- 환경 보호 참여 유도

## 4. 반응형 디자인

### 4.1 브레이크포인트
```css
/* 모바일 우선 접근법 */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### 4.2 모바일 최적화
- 터치 친화적 인터페이스 (최소 44px 터치 영역)
- 스와이프 제스처 지원
- 모바일 지도 인터랙션 최적화
- 오프라인 기능 지원 (PWA)

### 4.3 접근성 (A11y)
- WCAG 2.1 AA 준수
- 키보드 네비게이션 지원
- 스크린 리더 호환성
- 고대비 모드 지원
- 다국어 지원 (i18n)

## 5. 성능 최적화

### 5.1 코드 분할
- 페이지별 동적 임포트
- 컴포넌트 레벨 지연 로딩
- 라이브러리 번들 최적화

### 5.2 이미지 최적화
- Next.js Image 컴포넌트 활용
- WebP 포맷 지원
- 지연 로딩 (Lazy Loading)

### 5.3 캐싱 전략
- 서비스 워커를 통한 오프라인 캐싱
- API 응답 캐싱
- 정적 자산 CDN 활용

이 프론트엔드 명세서는 사용자 중심의 직관적이고 안정적인 대기질 내비게이션 서비스를 구현하기 위한 종합적인 설계 가이드입니다.
