import { useCallback, useEffect, useState } from 'react';
import { useMapStore } from '@/store/useMapStore';
import { useRouteStore } from '@/store/useRouteStore';
import { useAppStore } from '@/store/useAppStore';
import { calculateDistance, isValidCoordinate } from '@/utils/helpers';
import { MAP_DEFAULTS } from '@/utils/constants';
import type { Coordinate } from '@/types';

export function useMap() {
  const mapState = useMapStore();
  const routeState = useRouteStore();
  const appState = useAppStore();

  const [mapInstance, setMapInstance] = useState<kakao.maps.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // 지도 로드 완료 핸들러
  const handleMapLoad = useCallback((map: kakao.maps.Map) => {
    setMapInstance(map);
    setIsMapLoaded(true);
    
    // 지도 경계 계산
    const bounds = map.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    const boundsString = `${sw.getLat()},${sw.getLng()},${ne.getLat()},${ne.getLng()}`;
    
    mapState.setBounds(boundsString);
  }, [mapState]);

  // 지도 이동 완료 핸들러
  const handleMapDragEnd = useCallback((map: kakao.maps.Map) => {
    const center = map.getCenter();
    const bounds = map.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    const boundsString = `${sw.getLat()},${sw.getLng()},${ne.getLat()},${ne.getLng()}`;
    
    mapState.setCenter({
      latitude: center.getLat(),
      longitude: center.getLng(),
    });
    mapState.setBounds(boundsString);
  }, [mapState]);

  // 지도 줌 변경 핸들러
  const handleMapZoomChanged = useCallback((map: kakao.maps.Map) => {
    const level = map.getLevel();
    const bounds = map.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    const boundsString = `${sw.getLat()},${sw.getLng()},${ne.getLat()},${ne.getLng()}`;
    
    mapState.setZoom(level);
    mapState.setBounds(boundsString);
  }, [mapState]);

  // 지도 클릭 핸들러
  const handleMapClick = useCallback((_map: kakao.maps.Map, mouseEvent: kakao.maps.event.MouseEvent) => {
    const latlng = mouseEvent.latLng;
    const coordinate: Coordinate = {
      latitude: latlng.getLat(),
      longitude: latlng.getLng(),
    };
    
    // 지도 클릭 시 선택된 경로 해제
    mapState.setSelectedRouteId(undefined);
  }, [mapState]);

  // 지도 중심 이동
  const moveToCenter = useCallback((center: Coordinate, zoom?: number) => {
    if (mapInstance && isValidCoordinate(center)) {
      const moveLatLon = new kakao.maps.LatLng(center.latitude, center.longitude);
      mapInstance.setCenter(moveLatLon);
      
      if (zoom !== undefined) {
        mapInstance.setLevel(zoom);
      }
      
      mapState.setCenter(center);
      if (zoom !== undefined) {
        mapState.setZoom(zoom);
      }
    }
  }, [mapInstance, mapState]);

  // 경로에 맞게 지도 범위 조정
  const fitBounds = useCallback((coordinates: Coordinate[]) => {
    if (mapInstance && coordinates.length > 0) {
      const bounds = new kakao.maps.LatLngBounds();
      
      coordinates.forEach(coord => {
        if (isValidCoordinate(coord)) {
          bounds.extend(new kakao.maps.LatLng(coord.latitude, coord.longitude));
        }
      });
      
      mapInstance.setBounds(bounds);
    }
  }, [mapInstance]);

  // 현재 위치로 이동
  const moveToCurrentLocation = useCallback(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coordinate: Coordinate = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          moveToCenter(coordinate, 5);
        },
        (error) => {
          console.error('위치 정보를 가져올 수 없습니다:', error);
          appState.addNotification({
            type: 'error',
            title: '위치 오류',
            message: '현재 위치를 가져올 수 없습니다.',
          });
        }
      );
    } else {
      appState.addNotification({
        type: 'error',
        title: '지원하지 않는 기능',
        message: '이 브라우저는 위치 서비스를 지원하지 않습니다.',
      });
    }
  }, [moveToCenter, appState]);

  // 지도 리셋
  const resetMap = useCallback(() => {
    moveToCenter(MAP_DEFAULTS.CENTER, MAP_DEFAULTS.ZOOM);
    mapState.resetMap();
  }, [moveToCenter, mapState]);

  // 경로 선택 시 지도 범위 조정
  useEffect(() => {
    if (mapState.selectedRouteId && routeState.searchResults) {
      const selectedRoute = routeState.searchResults.find(
        route => route.route_id === mapState.selectedRouteId
      );
      
      if (selectedRoute && selectedRoute.waypoints.length > 0) {
        fitBounds(selectedRoute.waypoints);
      }
    }
  }, [mapState.selectedRouteId, routeState.searchResults, fitBounds]);

  // 검색 결과가 있을 때 지도 범위 조정
  useEffect(() => {
    if (routeState.searchResults && routeState.searchResults.length > 0) {
      const allWaypoints = routeState.searchResults.flatMap(route => route.waypoints);
      if (allWaypoints.length > 0) {
        fitBounds(allWaypoints);
      }
    }
  }, [routeState.searchResults, fitBounds]);

  return {
    // State
    mapState,
    isMapLoaded,
    mapInstance,
    
    // Actions
    handleMapLoad,
    handleMapDragEnd,
    handleMapZoomChanged,
    handleMapClick,
    moveToCenter,
    fitBounds,
    moveToCurrentLocation,
    resetMap,
    
    // Computed
    hasValidCenter: isValidCoordinate(mapState.center),
    hasValidBounds: mapState.bounds.length > 0,
  };
}
