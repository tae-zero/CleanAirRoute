// 대기질 등급별 상수
export const AIR_QUALITY_GRADES = {
  GOOD: 'good',
  MODERATE: 'moderate',
  UNHEALTHY: 'unhealthy',
  VERY_UNHEALTHY: 'very_unhealthy',
  HAZARDOUS: 'hazardous',
} as const;

export const AIR_QUALITY_LABELS = {
  [AIR_QUALITY_GRADES.GOOD]: '좋음',
  [AIR_QUALITY_GRADES.MODERATE]: '보통',
  [AIR_QUALITY_GRADES.UNHEALTHY]: '나쁨',
  [AIR_QUALITY_GRADES.VERY_UNHEALTHY]: '매우 나쁨',
  [AIR_QUALITY_GRADES.HAZARDOUS]: '위험',
} as const;

export const AIR_QUALITY_COLORS = {
  [AIR_QUALITY_GRADES.GOOD]: '#00E400',
  [AIR_QUALITY_GRADES.MODERATE]: '#FFFF00',
  [AIR_QUALITY_GRADES.UNHEALTHY]: '#FF7E00',
  [AIR_QUALITY_GRADES.VERY_UNHEALTHY]: '#FF0000',
  [AIR_QUALITY_GRADES.HAZARDOUS]: '#8F3F97',
} as const;

export const AIR_QUALITY_THRESHOLDS = {
  PM25: {
    [AIR_QUALITY_GRADES.GOOD]: 15,
    [AIR_QUALITY_GRADES.MODERATE]: 35,
    [AIR_QUALITY_GRADES.UNHEALTHY]: 75,
    [AIR_QUALITY_GRADES.VERY_UNHEALTHY]: 150,
  },
  PM10: {
    [AIR_QUALITY_GRADES.GOOD]: 30,
    [AIR_QUALITY_GRADES.MODERATE]: 80,
    [AIR_QUALITY_GRADES.UNHEALTHY]: 150,
    [AIR_QUALITY_GRADES.VERY_UNHEALTHY]: 300,
  },
  O3: {
    [AIR_QUALITY_GRADES.GOOD]: 0.03,
    [AIR_QUALITY_GRADES.MODERATE]: 0.09,
    [AIR_QUALITY_GRADES.UNHEALTHY]: 0.15,
    [AIR_QUALITY_GRADES.VERY_UNHEALTHY]: 0.2,
  },
} as const;

// 경로 타입별 상수
export const ROUTE_TYPES = {
  FASTEST: 'fastest',
  SHORTEST: 'shortest',
  HEALTHIEST: 'healthiest',
} as const;

export const ROUTE_TYPE_LABELS = {
  [ROUTE_TYPES.FASTEST]: '가장 빠른 경로',
  [ROUTE_TYPES.SHORTEST]: '가장 짧은 경로',
  [ROUTE_TYPES.HEALTHIEST]: '가장 건강한 경로',
} as const;

export const ROUTE_TYPE_COLORS = {
  [ROUTE_TYPES.FASTEST]: '#FF6B6B',
  [ROUTE_TYPES.SHORTEST]: '#4ECDC4',
  [ROUTE_TYPES.HEALTHIEST]: '#45B7D1',
} as const;

export const ROUTE_TYPE_ICONS = {
  [ROUTE_TYPES.FASTEST]: '⚡',
  [ROUTE_TYPES.SHORTEST]: '📏',
  [ROUTE_TYPES.HEALTHIEST]: '🌱',
} as const;

// 지도 관련 상수
export const MAP_DEFAULTS = {
  CENTER: {
    latitude: 37.5665,
    longitude: 126.9780,
  },
  ZOOM: 8,
  MIN_ZOOM: 1,
  MAX_ZOOM: 14,
} as const;

export const MAP_BOUNDS = {
  KOREA: {
    north: 38.612,
    south: 33.190,
    east: 131.869,
    west: 124.612,
  },
  SEOUL: {
    north: 37.715,
    south: 37.413,
    east: 127.269,
    west: 126.734,
  },
} as const;

// API 관련 상수
export const API_ENDPOINTS = {
  ROUTES: '/api/v1/routes',
  AIR_QUALITY: '/api/v1/air-quality',
  HEATMAP: '/api/v1/air-quality/heatmap',
  FORECAST: '/api/v1/air-quality/forecast',
  HEALTH: '/health',
} as const;

export const API_TIMEOUTS = {
  DEFAULT: 30000,
  ROUTE_SEARCH: 60000,
  HEATMAP: 15000,
  FORECAST: 20000,
} as const;

// 캐시 관련 상수
export const CACHE_KEYS = {
  ROUTES: 'routes',
  AIR_QUALITY: 'air_quality',
  HEATMAP: 'heatmap',
  FORECAST: 'forecast',
} as const;

export const CACHE_DURATIONS = {
  ROUTES: 5 * 60 * 1000, // 5분
  AIR_QUALITY: 10 * 60 * 1000, // 10분
  HEATMAP: 15 * 60 * 1000, // 15분
  FORECAST: 30 * 60 * 1000, // 30분
} as const;

// UI 관련 상수
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
} as const;

// 시간 관련 상수
export const TIME_FORMATS = {
  DATE: 'yyyy-MM-dd',
  TIME: 'HH:mm',
  DATETIME: 'yyyy-MM-dd HH:mm',
  DISPLAY_DATE: 'MM월 dd일',
  DISPLAY_TIME: 'HH시 mm분',
  DISPLAY_DATETIME: 'MM월 dd일 HH시 mm분',
} as const;

export const REFRESH_INTERVALS = {
  AIR_QUALITY: 10 * 60 * 1000, // 10분
  HEATMAP: 15 * 60 * 1000, // 15분
  FORECAST: 30 * 60 * 1000, // 30분
} as const;

// 오류 메시지
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  SERVER_ERROR: '서버 오류가 발생했습니다.',
  NOT_FOUND: '요청한 정보를 찾을 수 없습니다.',
  INVALID_INPUT: '입력한 정보가 올바르지 않습니다.',
  LOCATION_ERROR: '위치 정보를 가져올 수 없습니다.',
  ROUTE_ERROR: '경로를 찾을 수 없습니다.',
  AIR_QUALITY_ERROR: '대기질 정보를 가져올 수 없습니다.',
} as const;

// 성공 메시지
export const SUCCESS_MESSAGES = {
  ROUTE_FOUND: '경로를 성공적으로 찾았습니다.',
  LOCATION_SAVED: '위치가 저장되었습니다.',
  SETTINGS_SAVED: '설정이 저장되었습니다.',
} as const;

// 기본 설정값
export const DEFAULT_SETTINGS = {
  USER: {
    defaultRouteType: ROUTE_TYPES.HEALTHIEST,
    showNotifications: true,
    autoRefresh: true,
    refreshInterval: REFRESH_INTERVALS.AIR_QUALITY,
    theme: 'light' as const,
    language: 'ko' as const,
  },
  MAP: {
    defaultZoom: MAP_DEFAULTS.ZOOM,
    defaultCenter: MAP_DEFAULTS.CENTER,
    showTraffic: false,
    showTransit: true,
  },
  NOTIFICATIONS: {
    airQualityAlerts: true,
    routeUpdates: true,
    systemUpdates: false,
  },
} as const;
