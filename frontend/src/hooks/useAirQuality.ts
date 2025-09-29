import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';
import { useAppStore } from '@/store/useAppStore';
import { getCurrentAirQuality, getAirQualityHeatmap, getAirQualityForecast } from '@/services/api';
import { getAirQualityGrade, calculateAirQualityScore, getErrorMessage } from '@/utils/helpers';
import { CACHE_DURATIONS, REFRESH_INTERVALS } from '@/utils/constants';
import type { Coordinate, AirQualityData, HeatmapData, ForecastData } from '@/types';

// SWR fetcher 함수들
const airQualityFetcher = async (url: string, latitude: number, longitude: number, radius: number) => {
  return getCurrentAirQuality(latitude, longitude, radius);
};

const heatmapFetcher = async (url: string, bounds: string, timestamp?: string, pollutant?: string) => {
  return getAirQualityHeatmap(bounds, timestamp, pollutant);
};

const forecastFetcher = async (url: string, latitude: number, longitude: number, horizon: number) => {
  return getAirQualityForecast(latitude, longitude, horizon);
};

export function useAirQuality(coordinate: Coordinate, radius: number = 5) {
  const appState = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // 현재 대기질 데이터 조회
  const { data: airQualityData, error: airQualityError, mutate } = useSWR(
    coordinate ? ['air-quality', coordinate.latitude, coordinate.longitude, radius] : null,
    ([, lat, lng, rad]) => airQualityFetcher('', lat, lng, rad),
    {
      refreshInterval: REFRESH_INTERVALS.AIR_QUALITY,
      revalidateOnFocus: false,
      dedupingInterval: CACHE_DURATIONS.AIR_QUALITY,
      onError: (error) => {
        const errorMessage = getErrorMessage(error);
        setError(errorMessage);
        appState.addNotification({
          type: 'error',
          title: '대기질 정보 오류',
          message: errorMessage,
        });
      },
    }
  );

  // 수동 새로고침
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      await mutate();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [mutate]);

  // 대기질 등급 계산
  const airQualityGrade = useCallback((data: AirQualityData) => {
    return getAirQualityGrade(data.pm25, data.pm10, data.o3);
  }, []);

  // 대기질 점수 계산
  const airQualityScore = useCallback((data: AirQualityData) => {
    return calculateAirQualityScore(data);
  }, []);

  return {
    data: airQualityData,
    isLoading: isLoading || (!airQualityData && !airQualityError),
    error: error || airQualityError,
    refresh,
    airQualityGrade,
    airQualityScore,
  };
}

export function useAirQualityHeatmap(bounds: string, timestamp?: string, pollutant: string = 'pm25') {
  const appState = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // 히트맵 데이터 조회
  const { data: heatmapData, error: heatmapError, mutate } = useSWR(
    bounds ? ['heatmap', bounds, timestamp, pollutant] : null,
    ([, bounds, timestamp, pollutant]) => heatmapFetcher('', bounds, timestamp, pollutant),
    {
      refreshInterval: REFRESH_INTERVALS.HEATMAP,
      revalidateOnFocus: false,
      dedupingInterval: CACHE_DURATIONS.HEATMAP,
      onError: (error) => {
        const errorMessage = getErrorMessage(error);
        setError(errorMessage);
        appState.addNotification({
          type: 'error',
          title: '히트맵 데이터 오류',
          message: errorMessage,
        });
      },
    }
  );

  // 수동 새로고침
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      await mutate();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [mutate]);

  return {
    data: heatmapData?.data,
    isLoading: isLoading || (!heatmapData && !heatmapError),
    error: error || heatmapError,
    refresh,
  };
}

export function useAirQualityForecast(coordinate: Coordinate, horizon: number = 72) {
  const appState = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // 예측 데이터 조회
  const { data: forecastData, error: forecastError, mutate } = useSWR(
    coordinate ? ['forecast', coordinate.latitude, coordinate.longitude, horizon] : null,
    ([, lat, lng, horizon]) => forecastFetcher('', lat, lng, horizon),
    {
      refreshInterval: REFRESH_INTERVALS.FORECAST,
      revalidateOnFocus: false,
      dedupingInterval: CACHE_DURATIONS.FORECAST,
      onError: (error) => {
        const errorMessage = getErrorMessage(error);
        setError(errorMessage);
        appState.addNotification({
          type: 'error',
          title: '예측 데이터 오류',
          message: errorMessage,
        });
      },
    }
  );

  // 수동 새로고침
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      await mutate();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [mutate]);

  // 예측 데이터 가공
  const processedForecast = useCallback((data: any) => {
    if (!data?.forecasts) return [];
    
    return data.forecasts.map((forecast: any) => ({
      ...forecast,
      airQualityGrade: getAirQualityGrade(
        forecast.air_quality.pm25,
        forecast.air_quality.pm10,
        forecast.air_quality.o3
      ),
      airQualityScore: calculateAirQualityScore(forecast.air_quality),
    }));
  }, []);

  return {
    data: forecastData?.data,
    processedData: forecastData?.data ? processedForecast(forecastData.data) : [],
    isLoading: isLoading || (!forecastData && !forecastError),
    error: error || forecastError,
    refresh,
  };
}

// 대기질 등급별 건강 권고사항
export function useHealthRecommendations(airQualityData?: AirQualityData) {
  const getRecommendations = useCallback((data: AirQualityData) => {
    const grade = getAirQualityGrade(data.pm25, data.pm10, data.o3);
    
    const recommendations = {
      good: {
        outdoor: [
          '야외 활동에 적합합니다.',
          '창문을 열어 환기를 시켜주세요.',
          '운동이나 산책을 즐기세요.',
        ],
        indoor: [
          '실내 공기질을 유지하세요.',
          '정기적인 환기를 권장합니다.',
        ],
        sensitive: [
          '민감한 분들도 야외 활동이 가능합니다.',
        ],
      },
      moderate: {
        outdoor: [
          '일반인은 야외 활동이 가능합니다.',
          '장시간 야외 활동은 피하세요.',
        ],
        indoor: [
          '실내에서 활동하세요.',
          '필요시 공기청정기를 사용하세요.',
        ],
        sensitive: [
          '민감한 분들은 야외 활동을 제한하세요.',
          '마스크 착용을 권장합니다.',
        ],
      },
      unhealthy: {
        outdoor: [
          '야외 활동을 제한하세요.',
          '마스크 착용이 필요합니다.',
          '장시간 야외 노출을 피하세요.',
        ],
        indoor: [
          '실내에서 활동하세요.',
          '공기청정기를 가동하세요.',
          '창문을 닫고 실내 공기를 정화하세요.',
        ],
        sensitive: [
          '민감한 분들은 실내에 머물러야 합니다.',
          '외출 시 반드시 마스크를 착용하세요.',
        ],
      },
      very_unhealthy: {
        outdoor: [
          '야외 활동을 피하세요.',
          '외출 시 반드시 마스크를 착용하세요.',
          '장시간 야외 노출을 금지합니다.',
        ],
        indoor: [
          '실내에서만 활동하세요.',
          '공기청정기를 최대 성능으로 가동하세요.',
          '창문을 닫고 실내 공기를 정화하세요.',
        ],
        sensitive: [
          '민감한 분들은 외출을 금지합니다.',
          '실내에서만 활동하세요.',
        ],
      },
      hazardous: {
        outdoor: [
          '야외 활동을 금지합니다.',
          '외출을 피하세요.',
          '긴급한 경우에만 외출하세요.',
        ],
        indoor: [
          '실내에서만 활동하세요.',
          '공기청정기를 최대 성능으로 가동하세요.',
          '창문을 완전히 닫으세요.',
        ],
        sensitive: [
          '민감한 분들은 절대 외출하지 마세요.',
          '실내에서만 활동하세요.',
        ],
      },
    };

    return recommendations[grade as keyof typeof recommendations] || recommendations.moderate;
  }, []);

  return {
    recommendations: airQualityData ? getRecommendations(airQualityData) : null,
    getRecommendations,
  };
}

// 대기질 알림 기능
export function useAirQualityAlerts() {
  const appState = useAppStore();
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    type: 'warning' | 'caution' | 'info';
    message: string;
    timestamp: Date;
  }>>([]);

  const checkAirQualityAlert = useCallback((airQualityData: AirQualityData) => {
    const grade = getAirQualityGrade(airQualityData.pm25, airQualityData.pm10, airQualityData.o3);
    
    if (grade === 'unhealthy' || grade === 'very_unhealthy' || grade === 'hazardous') {
      const alertId = `air-quality-${Date.now()}`;
      const alert: {
        id: string;
        type: 'warning' | 'caution' | 'info';
        message: string;
        timestamp: Date;
      } = {
        id: alertId,
        type: grade === 'hazardous' ? 'warning' : 'caution',
        message: `대기질이 ${grade === 'hazardous' ? '위험' : '나쁨'} 수준입니다. 외출을 자제해주세요.`,
        timestamp: new Date(),
      };
      
      setAlerts(prev => [alert, ...prev.filter(a => a.id !== alertId)]);
      
      appState.addNotification({
        type: grade === 'hazardous' ? 'error' : 'warning',
        title: '대기질 경고',
        message: alert.message,
      });
    }
  }, [appState]);

  const clearAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  return {
    alerts,
    checkAirQualityAlert,
    clearAlert,
    clearAllAlerts,
  };
}
