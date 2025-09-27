'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Map as KakaoMap, MapMarker, Circle, Polyline } from 'react-kakao-maps-sdk';
import useSWR from 'swr';
import { Card, Icon, Spinner } from '@/components/atoms';
import { 
  getAirQualityHeatmap, 
  HeatmapResponse, 
  RouteInfo, 
  Coordinate 
} from '@/services/api';
import { AIR_QUALITY_COLORS, ROUTE_TYPE_COLORS } from '@/utils/constants';

interface MapProps {
  /** 지도 중심 좌표 */
  center: Coordinate;
  /** 지도 줌 레벨 */
  level?: number;
  /** 표시할 경로 데이터 */
  routes?: RouteInfo[];
  /** 선택된 경로 ID */
  selectedRouteId?: string;
  /** 경로 선택 콜백 */
  onRouteSelect?: (routeId: string) => void;
  /** 지도 클릭 콜백 */
  onMapClick?: (coordinate: Coordinate) => void;
  /** 히트맵 표시 여부 */
  showHeatmap?: boolean;
  /** 경로 표시 여부 */
  showRoutes?: boolean;
  /** 로딩 상태 */
  isLoading?: boolean;
}

interface HeatmapCircle {
  latitude: number;
  longitude: number;
  intensity: number;
  grade: string;
}

// 대기질 등급별 투명도
const AIR_QUALITY_OPACITY = {
  good: 0.3,
  moderate: 0.4,
  unhealthy: 0.5,
  very_unhealthy: 0.6,
  hazardous: 0.7,
} as const;

export default function Map({
  center,
  level = 8,
  routes = [],
  selectedRouteId,
  onRouteSelect,
  onMapClick,
  showHeatmap = true,
  showRoutes = true,
  isLoading = false,
}: MapProps) {
  // 상태 관리
  const [map, setMap] = useState<kakao.maps.Map | null>(null);
  const [mapBounds, setMapBounds] = useState<string>('');

  // 지도 경계 계산 함수
  const calculateBounds = useCallback((mapInstance: kakao.maps.Map) => {
    const bounds = mapInstance.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    
    return `${sw.getLat()},${sw.getLng()},${ne.getLat()},${ne.getLng()}`;
  }, []);

  // 지도 로드 완료 핸들러
  const handleMapLoad = useCallback((mapInstance: kakao.maps.Map) => {
    setMap(mapInstance);
    const bounds = calculateBounds(mapInstance);
    setMapBounds(bounds);
  }, [calculateBounds]);

  // 지도 이동 완료 핸들러
  const handleMapDragEnd = useCallback((mapInstance: kakao.maps.Map) => {
    const bounds = calculateBounds(mapInstance);
    setMapBounds(bounds);
  }, [calculateBounds]);

  // 지도 줌 변경 핸들러
  const handleMapZoomChanged = useCallback((mapInstance: kakao.maps.Map) => {
    const bounds = calculateBounds(mapInstance);
    setMapBounds(bounds);
  }, [calculateBounds]);

  // 지도 클릭 핸들러
  const handleMapClick = useCallback((_t: kakao.maps.Map, mouseEvent: kakao.maps.event.MouseEvent) => {
    const latlng = mouseEvent.latLng;
    const coordinate: Coordinate = {
      latitude: latlng.getLat(),
      longitude: latlng.getLng(),
    };
    onMapClick?.(coordinate);
  }, [onMapClick]);

  // 히트맵 데이터 페칭
  const { data: heatmapResponse, error: heatmapError } = useSWR<HeatmapResponse>(
    showHeatmap && mapBounds ? ['heatmap', mapBounds] : null,
    () => getAirQualityHeatmap(mapBounds),
    {
      refreshInterval: 300000, // 5분마다 새로고침
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1분간 중복 요청 방지
    }
  );

  // 선택된 경로 정보
  const selectedRoute = useMemo(() => {
    return routes.find(route => route.route_id === selectedRouteId);
  }, [routes, selectedRouteId]);

  // 경로 폴리라인 데이터 생성
  const routePolylines = useMemo(() => {
    if (!showRoutes || routes.length === 0) return [];

    return routes.map(route => ({
      path: route.waypoints.map(waypoint => ({
        lat: waypoint.latitude,
        lng: waypoint.longitude,
      })),
      strokeColor: ROUTE_TYPE_COLORS[route.type as keyof typeof ROUTE_TYPE_COLORS] || '#000000',
      strokeWeight: selectedRouteId === route.route_id ? 5 : 3,
      strokeOpacity: selectedRouteId === route.route_id ? 0.8 : 0.6,
      strokeStyle: selectedRouteId === route.route_id ? 'solid' : 'shortdash',
    }));
  }, [routes, selectedRouteId, showRoutes]);

  // 로딩 상태 표시
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <Card className="p-8 text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">지도를 로딩 중입니다...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Kakao Maps */}
      <KakaoMap
        center={{ lat: center.latitude, lng: center.longitude }}
        level={level}
        onCreate={handleMapLoad}
        onDragEnd={handleMapDragEnd}
        onZoomChanged={handleMapZoomChanged}
        onClick={handleMapClick}
        className="w-full h-full"
      >
        {/* 대기질 히트맵 원형 표시 */}
        {showHeatmap && heatmapResponse?.data?.heatmap_data.map((point, index) => (
          <Circle
            key={`heatmap-${index}`}
            center={{ lat: point.latitude, lng: point.longitude }}
            radius={200} // 반경 200m
            strokeWeight={0}
            fillColor={AIR_QUALITY_COLORS[point.grade as keyof typeof AIR_QUALITY_COLORS] || '#CCCCCC'}
            fillOpacity={AIR_QUALITY_OPACITY[point.grade as keyof typeof AIR_QUALITY_OPACITY] || 0.3}
          />
        ))}

        {/* 경로 폴리라인 표시 */}
        {routePolylines.map((polyline, index) => (
          <Polyline
            key={`route-${index}`}
            path={polyline.path}
            strokeColor={polyline.strokeColor}
            strokeWeight={polyline.strokeWeight}
            strokeOpacity={polyline.strokeOpacity}
            strokeStyle={polyline.strokeStyle}
          />
        ))}

        {/* 경로 마커 표시 */}
        {showRoutes && routes.map((route) => (
          <React.Fragment key={route.route_id}>
            {/* 출발지 마커 */}
            <MapMarker
              position={{ 
                lat: route.waypoints[0].latitude, 
                lng: route.waypoints[0].longitude 
              }}
              image={{
                src: '/icons/start-marker.png',
                size: { width: 30, height: 30 },
                options: { offset: { x: 15, y: 15 } }
              }}
              clickable={true}
              onClick={() => onRouteSelect?.(route.route_id)}
            />
            
            {/* 도착지 마커 */}
            <MapMarker
              position={{ 
                lat: route.waypoints[route.waypoints.length - 1].latitude, 
                lng: route.waypoints[route.waypoints.length - 1].longitude 
              }}
              image={{
                src: '/icons/end-marker.png',
                size: { width: 30, height: 30 },
                options: { offset: { x: 15, y: 15 } }
              }}
              clickable={true}
              onClick={() => onRouteSelect?.(route.route_id)}
            />
          </React.Fragment>
        ))}
      </KakaoMap>

      {/* 지도 컨트롤 오버레이 */}
      <div className="absolute top-4 right-4">
        <Card className="min-w-[200px]">
          <h3 className="font-semibold text-gray-800 mb-3">대기질 등급</h3>
          <div className="space-y-2">
            {Object.entries(AIR_QUALITY_COLORS).map(([grade, color]) => (
              <div key={grade} className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-gray-700 capitalize">
                  {grade === 'good' ? '좋음' :
                   grade === 'moderate' ? '보통' :
                   grade === 'unhealthy' ? '나쁨' :
                   grade === 'very_unhealthy' ? '매우 나쁨' :
                   grade === 'hazardous' ? '위험' : grade}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 경로 정보 오버레이 */}
      {selectedRoute && (
        <div className="absolute bottom-4 left-4">
          <Card className="max-w-[300px]">
            <h3 className="font-semibold text-gray-800 mb-2">
              {selectedRoute.type === 'fastest' ? '가장 빠른 경로' :
               selectedRoute.type === 'shortest' ? '가장 짧은 경로' :
               selectedRoute.type === 'healthiest' ? '가장 건강한 경로' : selectedRoute.type}
            </h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>소요시간: {selectedRoute.summary.duration}분</p>
              <p>거리: {selectedRoute.summary.distance.toFixed(1)}km</p>
              <p>대기질 점수: {selectedRoute.summary.air_quality_score}/100</p>
              <p>PM2.5 노출: {selectedRoute.summary.pollution_exposure.pm25.toFixed(1)}μg/m³</p>
            </div>
          </Card>
        </div>
      )}

      {/* 로딩 인디케이터 */}
      {showHeatmap && !heatmapResponse && !heatmapError && (
        <div className="absolute top-4 left-4">
          <Card className="p-3">
            <div className="flex items-center space-x-2">
              <Spinner size="sm" />
              <span className="text-sm text-gray-600">대기질 데이터 로딩 중...</span>
            </div>
          </Card>
        </div>
      )}

      {/* 에러 메시지 */}
      {heatmapError && (
        <div className="absolute top-4 left-4">
          <Card className="p-3 bg-red-50 border-red-200">
            <p className="text-sm text-red-600">
              대기질 데이터를 불러올 수 없습니다.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
