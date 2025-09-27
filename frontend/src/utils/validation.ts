import { z } from 'zod';
import { ERROR_MESSAGES } from './constants';

// 기본 검증 스키마
export const coordinateSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const locationSchema = z.object({
  name: z.string().min(1, '위치명을 입력해주세요'),
  address: z.string().min(1, '주소를 입력해주세요'),
  coordinate: coordinateSchema,
});

// 대기질 데이터 검증 스키마
export const airQualitySchema = z.object({
  pm25: z.number().min(0).max(1000),
  pm10: z.number().min(0).max(1000),
  o3: z.number().min(0).max(1),
  no2: z.number().min(0).max(1),
  co: z.number().min(0).max(100),
  so2: z.number().min(0).max(1),
  air_quality_index: z.number().min(0).max(500),
  grade: z.enum(['good', 'moderate', 'unhealthy', 'very_unhealthy', 'hazardous']),
  measured_at: z.string().datetime(),
});

// 경로 요청 검증 스키마
export const routeRequestSchema = z.object({
  start: coordinateSchema,
  end: coordinateSchema,
  route_types: z.array(z.enum(['fastest', 'shortest', 'healthiest'])).optional(),
  preferences: z.object({
    max_duration: z.number().min(1).max(1440).optional(), // 최대 24시간
    max_distance: z.number().min(0.1).max(1000).optional(), // 최대 1000km
    min_air_quality_score: z.number().min(0).max(100).optional(),
  }).optional(),
});

// 검색 폼 검증 스키마
export const searchFormSchema = z.object({
  startAddress: z.string().min(1, '출발지를 입력해주세요'),
  endAddress: z.string().min(1, '도착지를 입력해주세요'),
  startCoordinate: coordinateSchema.optional(),
  endCoordinate: coordinateSchema.optional(),
  routeTypes: z.array(z.string()).min(1, '최소 하나의 경로 타입을 선택해주세요'),
  preferences: z.object({
    maxDuration: z.number().min(1).max(1440),
    maxDistance: z.number().min(0.1).max(1000),
    minAirQualityScore: z.number().min(0).max(100),
  }),
});

// 사용자 설정 검증 스키마
export const userPreferencesSchema = z.object({
  defaultRouteType: z.enum(['fastest', 'shortest', 'healthiest']),
  showNotifications: z.boolean(),
  autoRefresh: z.boolean(),
  refreshInterval: z.number().min(30000).max(3600000), // 30초 ~ 1시간
  theme: z.enum(['light', 'dark', 'auto']),
  language: z.enum(['ko', 'en']),
});

// 검증 함수들
export function validateCoordinate(coord: unknown): { isValid: boolean; error?: string } {
  try {
    coordinateSchema.parse(coord);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0].message };
    }
    return { isValid: false, error: ERROR_MESSAGES.INVALID_INPUT };
  }
}

export function validateLocation(location: unknown): { isValid: boolean; error?: string } {
  try {
    locationSchema.parse(location);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0].message };
    }
    return { isValid: false, error: ERROR_MESSAGES.INVALID_INPUT };
  }
}

export function validateRouteRequest(request: unknown): { isValid: boolean; error?: string } {
  try {
    routeRequestSchema.parse(request);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0].message };
    }
    return { isValid: false, error: ERROR_MESSAGES.INVALID_INPUT };
  }
}

export function validateSearchForm(form: unknown): { isValid: boolean; error?: string } {
  try {
    searchFormSchema.parse(form);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0].message };
    }
    return { isValid: false, error: ERROR_MESSAGES.INVALID_INPUT };
  }
}

export function validateUserPreferences(preferences: unknown): { isValid: boolean; error?: string } {
  try {
    userPreferencesSchema.parse(preferences);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0].message };
    }
    return { isValid: false, error: ERROR_MESSAGES.INVALID_INPUT };
  }
}

// 주소 검증 함수
export function validateAddress(address: string): { isValid: boolean; error?: string } {
  if (!address || address.trim().length === 0) {
    return { isValid: false, error: '주소를 입력해주세요' };
  }
  
  if (address.trim().length < 2) {
    return { isValid: false, error: '주소는 최소 2글자 이상이어야 합니다' };
  }
  
  if (address.trim().length > 100) {
    return { isValid: false, error: '주소는 100글자를 초과할 수 없습니다' };
  }
  
  // 특수문자 검증 (기본적인 검증)
  const specialChars = /[<>{}[\]\\|`~!@#$%^&*()+=]/;
  if (specialChars.test(address)) {
    return { isValid: false, error: '주소에 특수문자를 사용할 수 없습니다' };
  }
  
  return { isValid: true };
}

// 이메일 검증 함수
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: '이메일을 입력해주세요' };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: '올바른 이메일 형식이 아닙니다' };
  }
  
  return { isValid: true };
}

// 전화번호 검증 함수
export function validatePhoneNumber(phone: string): { isValid: boolean; error?: string } {
  const phoneRegex = /^[0-9-+\s()]+$/;
  
  if (!phone || phone.trim().length === 0) {
    return { isValid: false, error: '전화번호를 입력해주세요' };
  }
  
  if (!phoneRegex.test(phone)) {
    return { isValid: false, error: '올바른 전화번호 형식이 아닙니다' };
  }
  
  // 숫자만 추출하여 길이 확인
  const digitsOnly = phone.replace(/[^0-9]/g, '');
  if (digitsOnly.length < 10 || digitsOnly.length > 11) {
    return { isValid: false, error: '전화번호는 10-11자리여야 합니다' };
  }
  
  return { isValid: true };
}

// 비밀번호 검증 함수
export function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (!password || password.length === 0) {
    return { isValid: false, error: '비밀번호를 입력해주세요' };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: '비밀번호는 최소 8자리여야 합니다' };
  }
  
  if (password.length > 128) {
    return { isValid: false, error: '비밀번호는 128자리를 초과할 수 없습니다' };
  }
  
  // 복잡도 검증
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const complexityScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
  
  if (complexityScore < 2) {
    return { isValid: false, error: '비밀번호는 대소문자, 숫자, 특수문자 중 최소 2가지 이상을 포함해야 합니다' };
  }
  
  return { isValid: true };
}

// URL 검증 함수
export function validateUrl(url: string): { isValid: boolean; error?: string } {
  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: '올바른 URL 형식이 아닙니다' };
  }
}

// 파일 크기 검증 함수
export function validateFileSize(file: File, maxSizeInMB: number): { isValid: boolean; error?: string } {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  
  if (file.size > maxSizeInBytes) {
    return { isValid: false, error: `파일 크기는 ${maxSizeInMB}MB를 초과할 수 없습니다` };
  }
  
  return { isValid: true };
}

// 파일 타입 검증 함수
export function validateFileType(file: File, allowedTypes: string[]): { isValid: boolean; error?: string } {
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: `허용되지 않는 파일 형식입니다. 허용 형식: ${allowedTypes.join(', ')}` };
  }
  
  return { isValid: true };
}

// 숫자 범위 검증 함수
export function validateNumberRange(value: number, min: number, max: number): { isValid: boolean; error?: string } {
  if (value < min) {
    return { isValid: false, error: `값은 ${min} 이상이어야 합니다` };
  }
  
  if (value > max) {
    return { isValid: false, error: `값은 ${max} 이하여야 합니다` };
  }
  
  return { isValid: true };
}

// 문자열 길이 검증 함수
export function validateStringLength(str: string, min: number, max: number): { isValid: boolean; error?: string } {
  if (str.length < min) {
    return { isValid: false, error: `최소 ${min}글자 이상이어야 합니다` };
  }
  
  if (str.length > max) {
    return { isValid: false, error: `최대 ${max}글자까지 입력 가능합니다` };
  }
  
  return { isValid: true };
}
