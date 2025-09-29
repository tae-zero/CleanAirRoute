/**
 * API 서비스 모듈
 * - 재사용 가능하고 타입-세이프한 API 통신 모듈
 * - axios 기반 HTTP 클라이언트
 * - 에러 처리 및 로깅 포함
 */

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// API 기본 URL 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// TypeScript 인터페이스 정의
export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface RouteRequestParams {
  start_lat: number;
  start_lon: number;
  end_lat: number;
  end_lon: number;
  route_types?: string;
}

export interface RouteSegment {
  start: Coordinate;
  end: Coordinate;
  distance: number;
  duration: number;
  air_quality: {
    pm25: number;
    pm10: number;
    o3: number;
    no2: number;
    air_quality_index: number;
    grade: 'good' | 'moderate' | 'unhealthy' | 'very_unhealthy' | 'hazardous';
  };
  instructions: string;
}

export interface RouteInfo {
  route_id: string;
  type: 'fastest' | 'shortest' | 'healthiest';
  summary: {
    duration: number;
    distance: number;
    air_quality_score: number;
    pollution_exposure: {
      pm25: number;
      pm10: number;
      o3: number;
    };
  };
  waypoints: Coordinate[];
  segments: RouteSegment[];
  polyline: string;
}

export interface RouteResponse {
  success: boolean;
  routes: RouteInfo[];
  calculation_time: string;
  message: string;
}

export interface AirQualityData {
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  co: number;
  so2: number;
  air_quality_index: number;
  grade: 'good' | 'moderate' | 'unhealthy' | 'very_unhealthy' | 'hazardous';
  measured_at: string;
}

export interface AirQualityResponse {
  location: Coordinate;
  air_quality: AirQualityData;
  station_info: {
    station_id: string;
    station_name: string;
    coordinate: Coordinate;
    distance: number;
  };
}

export interface HeatmapData {
  timestamp: string;
  pollutant: string;
  heatmap_data: Array<{
    latitude: number;
    longitude: number;
    intensity: number;
    grade: string;
  }>;
  color_scale: {
    good: string;
    moderate: string;
    unhealthy: string;
    very_unhealthy: string;
    hazardous: string;
  };
}

export interface HeatmapResponse {
  success: boolean;
  data: HeatmapData;
  message: string;
}

export interface ApiError {
  success: false;
  message: string;
  error: {
    code: string;
    details: string;
  };
  timestamp: string;
  version: string;
}

// API 클라이언트 클래스
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // 30초 타임아웃
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 요청 인터셉터
    this.client.interceptors.request.use(
      (config: any) => {
        // console.log(`API 요청: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error: any) => {
        console.error('요청 인터셉터 오류:', error);
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // console.log(`API 응답: ${response.status} ${response.config.url}`);
        return response;
      },
      (error: AxiosError) => {
        console.error('응답 인터셉터 오류:', error);
        return this.handleError(error);
      }
    );
  }

  /**
   * 에러 처리 함수
   */
  private handleError(error: AxiosError): Promise<never> {
    if (error.response) {
      // 서버에서 응답을 받았지만 에러 상태 코드
      const status = error.response.status;
      const data = error.response.data as ApiError;
      
      console.error(`API 에러 ${status}:`, data);
      
      // 사용자 친화적인 에러 메시지 생성
      let message = '서버 오류가 발생했습니다.';
      
      if (data?.message) {
        message = data.message;
      } else if (status === 404) {
        message = '요청한 리소스를 찾을 수 없습니다.';
      } else if (status === 500) {
        message = '서버 내부 오류가 발생했습니다.';
      } else if (status === 503) {
        message = '서비스를 일시적으로 사용할 수 없습니다.';
      }
      
      const customError = new Error(message);
      (customError as any).status = status;
      (customError as any).data = data;
      
      return Promise.reject(customError);
    } else if (error.request) {
      // 요청이 전송되었지만 응답을 받지 못함
      console.error('네트워크 오류:', error.request);
      const networkError = new Error('네트워크 연결을 확인해주세요.');
      (networkError as any).isNetworkError = true;
      return Promise.reject(networkError);
    } else {
      // 요청 설정 중 오류 발생
      console.error('요청 설정 오류:', error.message);
      return Promise.reject(new Error('요청 처리 중 오류가 발생했습니다.'));
    }
  }

  /**
   * 경로 추천 API 호출
   */
  async getRouteRecommendations(params: RouteRequestParams): Promise<RouteResponse> {
    try {
      const response = await this.client.get<RouteResponse>('/api/v1/routes', {
        params: {
          start_lat: params.start_lat,
          start_lon: params.start_lon,
          end_lat: params.end_lat,
          end_lon: params.end_lon,
          route_types: params.route_types || 'fastest,shortest,healthiest',
        },
      });

      return response.data;
    } catch (error) {
      console.error('경로 추천 API 호출 실패:', error);
      throw error;
    }
  }

  /**
   * 현재 대기질 조회 API
   */
  async getCurrentAirQuality(latitude: number, longitude: number, radius: number = 5): Promise<AirQualityResponse> {
    try {
      const response = await this.client.get<any>('/api/v1/air-quality/current', {
        params: {
          latitude,
          longitude,
          radius,
        },
      });

      // API 응답을 AirQualityResponse 형태로 변환
      const apiData = response.data;
      return {
        location: { latitude, longitude },
        air_quality: {
          pm25: apiData.pm25 || 0,
          pm10: apiData.pm10 || 0,
          o3: apiData.o3 || 0,
          no2: apiData.no2 || 0,
          co: apiData.co || 0,
          so2: apiData.so2 || 0,
          air_quality_index: apiData.air_quality_index || 0,
          grade: (apiData.grade as 'good' | 'moderate' | 'unhealthy' | 'very_unhealthy' | 'hazardous') || 'good',
          measured_at: apiData.measured_at || new Date().toISOString(),
        },
        station_info: {
          station_id: apiData.station_id || 'unknown',
          station_name: apiData.station_name || '알 수 없는 측정소',
          coordinate: { latitude, longitude },
          distance: apiData.distance || 0,
        },
      };
    } catch (error) {
      console.error('현재 대기질 조회 API 호출 실패:', error);
      throw error;
    }
  }

  /**
   * 대기질 히트맵 데이터 조회 API
   */
  async getAirQualityHeatmap(
    bounds: string,
    timestamp?: string,
    pollutant: string = 'pm25'
  ): Promise<HeatmapResponse> {
    try {
      const response = await this.client.get<HeatmapResponse>('/api/v1/air-quality/heatmap', {
        params: {
          bounds,
          timestamp,
          pollutant,
        },
      });

      return response.data;
    } catch (error) {
      console.error('대기질 히트맵 API 호출 실패:', error);
      throw error;
    }
  }

  /**
   * 대기질 예측 조회 API
   */
  async getAirQualityForecast(
    latitude: number,
    longitude: number,
    horizon: number = 72
  ): Promise<any> {
    try {
      const response = await this.client.get('/api/v1/air-quality/forecast', {
        params: {
          latitude,
          longitude,
          horizon,
        },
      });

      return response.data;
    } catch (error) {
      console.error('대기질 예측 API 호출 실패:', error);
      throw error;
    }
  }

  /**
   * 헬스체크 API
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      console.error('헬스체크 API 호출 실패:', error);
      throw error;
    }
  }
}

// API 클라이언트 인스턴스 생성 및 내보내기
export const apiClient = new ApiClient();

// 편의 함수들
export const getRouteRecommendations = (params: RouteRequestParams) => 
  apiClient.getRouteRecommendations(params);

export const getCurrentAirQuality = (latitude: number, longitude: number, radius?: number) => 
  apiClient.getCurrentAirQuality(latitude, longitude, radius);

export const getAirQualityHeatmap = (bounds: string, timestamp?: string, pollutant?: string) => 
  apiClient.getAirQualityHeatmap(bounds, timestamp, pollutant);

export const getAirQualityForecast = (latitude: number, longitude: number, horizon?: number) => 
  apiClient.getAirQualityForecast(latitude, longitude, horizon);

export const healthCheck = () => apiClient.healthCheck();

// 에러 타입 가드 함수
export const isApiError = (error: unknown): error is Error & { status?: number; data?: ApiError } => {
  return error instanceof Error && 'status' in error;
};

export const isNetworkError = (error: unknown): error is Error & { isNetworkError: boolean } => {
  return error instanceof Error && 'isNetworkError' in error;
};

export default apiClient;
