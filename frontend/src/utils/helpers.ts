import { format, parseISO, isValid } from 'date-fns';
import { ko } from 'date-fns/locale';
import { 
  AIR_QUALITY_GRADES, 
  AIR_QUALITY_THRESHOLDS, 
  TIME_FORMATS,
  ERROR_MESSAGES 
} from './constants';
import type { Coordinate, AirQualityData } from '@/types';

/**
 * 대기질 등급을 판단하는 함수
 */
export function getAirQualityGrade(pm25: number, pm10: number, o3: number): string {
  if (pm25 <= AIR_QUALITY_THRESHOLDS.PM25[AIR_QUALITY_GRADES.GOOD] &&
      pm10 <= AIR_QUALITY_THRESHOLDS.PM10[AIR_QUALITY_GRADES.GOOD] &&
      o3 <= AIR_QUALITY_THRESHOLDS.O3[AIR_QUALITY_GRADES.GOOD]) {
    return AIR_QUALITY_GRADES.GOOD;
  }
  
  if (pm25 <= AIR_QUALITY_THRESHOLDS.PM25[AIR_QUALITY_GRADES.MODERATE] &&
      pm10 <= AIR_QUALITY_THRESHOLDS.PM10[AIR_QUALITY_GRADES.MODERATE] &&
      o3 <= AIR_QUALITY_THRESHOLDS.O3[AIR_QUALITY_GRADES.MODERATE]) {
    return AIR_QUALITY_GRADES.MODERATE;
  }
  
  if (pm25 <= AIR_QUALITY_THRESHOLDS.PM25[AIR_QUALITY_GRADES.UNHEALTHY] &&
      pm10 <= AIR_QUALITY_THRESHOLDS.PM10[AIR_QUALITY_GRADES.UNHEALTHY] &&
      o3 <= AIR_QUALITY_THRESHOLDS.O3[AIR_QUALITY_GRADES.UNHEALTHY]) {
    return AIR_QUALITY_GRADES.UNHEALTHY;
  }
  
  if (pm25 <= AIR_QUALITY_THRESHOLDS.PM25[AIR_QUALITY_GRADES.VERY_UNHEALTHY] &&
      pm10 <= AIR_QUALITY_THRESHOLDS.PM10[AIR_QUALITY_GRADES.VERY_UNHEALTHY] &&
      o3 <= AIR_QUALITY_THRESHOLDS.O3[AIR_QUALITY_GRADES.VERY_UNHEALTHY]) {
    return AIR_QUALITY_GRADES.VERY_UNHEALTHY;
  }
  
  return AIR_QUALITY_GRADES.HAZARDOUS;
}

/**
 * 대기질 점수를 계산하는 함수 (0-100)
 */
export function calculateAirQualityScore(airQuality: AirQualityData): number {
  const { pm25, pm10, o3 } = airQuality;
  
  // 각 오염물질별 점수 계산 (낮을수록 좋음)
  const pm25Score = Math.max(0, 100 - (pm25 / 150) * 100);
  const pm10Score = Math.max(0, 100 - (pm10 / 300) * 100);
  const o3Score = Math.max(0, 100 - (o3 / 0.2) * 100);
  
  // 가중 평균 (PM2.5가 가장 중요)
  return Math.round((pm25Score * 0.5 + pm10Score * 0.3 + o3Score * 0.2));
}

/**
 * 두 좌표 간의 거리를 계산하는 함수 (Haversine 공식)
 */
export function calculateDistance(coord1: Coordinate, coord2: Coordinate): number {
  const R = 6371; // 지구 반지름 (km)
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) * Math.cos(toRadians(coord2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 각도를 라디안으로 변환
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * 시간을 포맷팅하는 함수
 */
export function formatTime(date: Date | string, formatStr: string = TIME_FORMATS.DISPLAY_DATETIME): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(dateObj)) {
      throw new Error('Invalid date');
    }
    
    return format(dateObj, formatStr, { locale: ko });
  } catch (error) {
    console.error('Date formatting error:', error);
    return '시간 정보 없음';
  }
}

/**
 * 상대 시간을 표시하는 함수 (예: "3분 전", "1시간 전")
 */
export function formatRelativeTime(date: Date | string): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(dateObj)) {
      throw new Error('Invalid date');
    }
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return '방금 전';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}일 전`;
    }
    
    return format(dateObj, TIME_FORMATS.DISPLAY_DATE, { locale: ko });
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return '시간 정보 없음';
  }
}

/**
 * 숫자를 천 단위로 구분하여 표시
 */
export function formatNumber(num: number, decimals: number = 0): string {
  return new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * 거리를 포맷팅하는 함수
 */
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
}

/**
 * 시간을 포맷팅하는 함수
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}분`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}시간`;
  }
  
  return `${hours}시간 ${remainingMinutes}분`;
}

/**
 * 클래스명을 조건부로 결합하는 함수
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * 디바운스 함수
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * 스로틀 함수
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 로컬 스토리지에 안전하게 저장
 */
export function setLocalStorage(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('LocalStorage 저장 실패:', error);
  }
}

/**
 * 로컬 스토리지에서 안전하게 가져오기
 */
export function getLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('LocalStorage 읽기 실패:', error);
    return defaultValue;
  }
}

/**
 * 에러 메시지를 사용자 친화적으로 변환
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.status === 404) {
    return ERROR_MESSAGES.NOT_FOUND;
  }
  
  if (error?.status >= 500) {
    return ERROR_MESSAGES.SERVER_ERROR;
  }
  
  if (error?.isNetworkError) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  
  return ERROR_MESSAGES.SERVER_ERROR;
}

/**
 * 좌표가 유효한지 확인
 */
export function isValidCoordinate(coord: Coordinate): boolean {
  return (
    typeof coord.latitude === 'number' &&
    typeof coord.longitude === 'number' &&
    coord.latitude >= -90 &&
    coord.latitude <= 90 &&
    coord.longitude >= -180 &&
    coord.longitude <= 180
  );
}

/**
 * 한국 좌표 범위 내에 있는지 확인
 */
export function isInKorea(coord: Coordinate): boolean {
  return (
    coord.latitude >= 33.190 &&
    coord.latitude <= 38.612 &&
    coord.longitude >= 124.612 &&
    coord.longitude <= 131.869
  );
}

/**
 * URL 파라미터를 객체로 변환
 */
export function parseUrlParams(url: string): Record<string, string> {
  const params = new URLSearchParams(url.split('?')[1]);
  const result: Record<string, string> = {};
  
  for (const [key, value] of params) {
    result[key] = value;
  }
  
  return result;
}

/**
 * 객체를 URL 파라미터로 변환
 */
export function stringifyUrlParams(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  
  return searchParams.toString();
}

/**
 * 배열을 청크로 나누는 함수
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  
  return chunks;
}

/**
 * 배열에서 중복 제거
 */
export function unique<T>(array: T[], key?: keyof T): T[] {
  if (!key) {
    return [...new Set(array)];
  }
  
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

/**
 * 깊은 복사 함수
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T;
  }
  
  if (typeof obj === 'object') {
    const cloned = {} as T;
    Object.keys(obj).forEach(key => {
      (cloned as any)[key] = deepClone((obj as any)[key]);
    });
    return cloned;
  }
  
  return obj;
}

/**
 * 경로 요청 유효성 검사
 */
export function validateRouteRequest(request: unknown): { isValid: boolean; error?: string } {
  if (!request) {
    return { isValid: false, error: '요청 데이터가 없습니다.' };
  }
  
  if (!request.start || !request.end) {
    return { isValid: false, error: '출발지와 도착지가 필요합니다.' };
  }
  
  if (!request.start.latitude || !request.start.longitude) {
    return { isValid: false, error: '출발지 좌표가 필요합니다.' };
  }
  
  if (!request.end.latitude || !request.end.longitude) {
    return { isValid: false, error: '도착지 좌표가 필요합니다.' };
  }
  
  if (!isValidCoordinate(request.start) || !isValidCoordinate(request.end)) {
    return { isValid: false, error: '유효하지 않은 좌표입니다.' };
  }
  
  return { isValid: true };
}
