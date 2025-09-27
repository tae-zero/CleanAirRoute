import { useCallback, useEffect, useState } from 'react';
import { useRouteStore } from '@/store/useRouteStore';
import { useMapStore } from '@/store/useMapStore';
import { useAppStore } from '@/store/useAppStore';
import { getRouteRecommendations } from '@/services/api';
import { validateRouteRequest, getErrorMessage } from '@/utils/helpers';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/utils/constants';
import type { RouteRequest, Location, Coordinate } from '@/types';

export function useRoute() {
  const routeState = useRouteStore();
  const mapState = useMapStore();
  const appState = useAppStore();

  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | undefined>();

  // 경로 검색
  const searchRoutes = useCallback(async (request: RouteRequest) => {
    try {
      // 입력 검증
      const validation = validateRouteRequest(request);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      setIsSearching(true);
      setSearchError(undefined);
      routeState.setSearching(true);
      routeState.setError(undefined);

      // API 호출
      const response = await getRouteRecommendations({
        start_lat: request.start.latitude,
        start_lon: request.start.longitude,
        end_lat: request.end.latitude,
        end_lon: request.end.longitude,
        route_types: request.route_types?.join(','),
      });

      if (response.success && response.routes) {
        routeState.setSearchResults(response.routes);
        
        // 첫 번째 경로를 기본 선택
        if (response.routes.length > 0) {
          mapState.setSelectedRouteId(response.routes[0].route_id);
        }

        appState.addNotification({
          type: 'success',
          title: '경로 검색 완료',
          message: `${response.routes.length}개의 경로를 찾았습니다.`,
        });
      } else {
        throw new Error(response.message || ERROR_MESSAGES.ROUTE_ERROR);
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setSearchError(errorMessage);
      routeState.setError(errorMessage);
      
      appState.addNotification({
        type: 'error',
        title: '경로 검색 실패',
        message: errorMessage,
      });
    } finally {
      setIsSearching(false);
      routeState.setSearching(false);
    }
  }, [routeState, mapState, appState]);

  // 출발지/도착지 설정
  const setStartLocation = useCallback((location: Location) => {
    routeState.setStartLocation(location);
  }, [routeState]);

  const setEndLocation = useCallback((location: Location) => {
    routeState.setEndLocation(location);
  }, [routeState]);

  // 위치 교체
  const swapLocations = useCallback(() => {
    const start = routeState.startLocation;
    const end = routeState.endLocation;
    
    if (start && end) {
      routeState.setStartLocation(end);
      routeState.setEndLocation(start);
    }
  }, [routeState]);

  // 경로 선택
  const selectRoute = useCallback((routeId: string) => {
    mapState.setSelectedRouteId(routeId);
  }, [mapState]);

  // 경로 즐겨찾기 추가/제거
  const toggleFavorite = useCallback((route: any) => {
    const isFavorited = routeState.favoriteRoutes.some(
      favRoute => favRoute.route_id === route.route_id
    );
    
    if (isFavorited) {
      routeState.removeFromFavorites(route.route_id);
      appState.addNotification({
        type: 'info',
        title: '즐겨찾기 제거',
        message: '경로가 즐겨찾기에서 제거되었습니다.',
      });
    } else {
      routeState.addToFavorites(route);
      appState.addNotification({
        type: 'success',
        title: '즐겨찾기 추가',
        message: '경로가 즐겨찾기에 추가되었습니다.',
      });
    }
  }, [routeState, appState]);

  // 검색 기록 추가
  const addToHistory = useCallback((route: any) => {
    routeState.addToHistory(route);
  }, [routeState]);

  // 최근 검색 추가
  const addRecentSearch = useCallback((start: Location, end: Location) => {
    routeState.addRecentSearch(start, end);
  }, [routeState]);

  // 검색 초기화
  const clearSearch = useCallback(() => {
    routeState.clearSearch();
    mapState.setSelectedRouteId(undefined);
    setSearchError(undefined);
  }, [routeState, mapState]);

  // 검색 기록 초기화
  const clearHistory = useCallback(() => {
    routeState.clearHistory();
    appState.addNotification({
      type: 'info',
      title: '검색 기록 삭제',
      message: '검색 기록이 삭제되었습니다.',
    });
  }, [routeState, appState]);

  // 최근 검색 초기화
  const clearRecentSearches = useCallback(() => {
    routeState.clearRecentSearches();
    appState.addNotification({
      type: 'info',
      title: '최근 검색 삭제',
      message: '최근 검색 기록이 삭제되었습니다.',
    });
  }, [routeState, appState]);

  // 유효한 검색 조건인지 확인
  const canSearch = useCallback(() => {
    return !!(
      routeState.startLocation &&
      routeState.endLocation &&
      !isSearching &&
      routeState.startLocation.coordinate.latitude !== routeState.endLocation.coordinate.latitude &&
      routeState.startLocation.coordinate.longitude !== routeState.endLocation.coordinate.longitude
    );
  }, [routeState.startLocation, routeState.endLocation, isSearching]);

  // 검색 실행
  const executeSearch = useCallback(() => {
    if (!canSearch()) {
      appState.addNotification({
        type: 'warning',
        title: '검색 불가',
        message: '출발지와 도착지를 모두 입력해주세요.',
      });
      return;
    }

    const request: RouteRequest = {
      start: routeState.startLocation!.coordinate,
      end: routeState.endLocation!.coordinate,
      route_types: ['fastest', 'shortest', 'healthiest'],
    };

    searchRoutes(request);
    
    // 최근 검색에 추가
    addRecentSearch(routeState.startLocation!, routeState.endLocation!);
  }, [canSearch, searchRoutes, addRecentSearch, routeState.startLocation, routeState.endLocation, appState]);

  // 검색 결과가 변경될 때마다 히스토리에 추가
  useEffect(() => {
    if (routeState.searchResults && routeState.searchResults.length > 0) {
      const selectedRoute = routeState.searchResults.find(
        route => route.route_id === mapState.selectedRouteId
      );
      
      if (selectedRoute) {
        addToHistory(selectedRoute);
      }
    }
  }, [routeState.searchResults, mapState.selectedRouteId, addToHistory]);

  return {
    // State
    startLocation: routeState.startLocation,
    endLocation: routeState.endLocation,
    searchResults: routeState.searchResults,
    searchHistory: routeState.searchHistory,
    favoriteRoutes: routeState.favoriteRoutes,
    recentSearches: routeState.recentSearches,
    isSearching,
    searchError,
    selectedRouteId: mapState.selectedRouteId,
    
    // Actions
    setStartLocation,
    setEndLocation,
    swapLocations,
    searchRoutes,
    selectRoute,
    toggleFavorite,
    clearSearch,
    clearHistory,
    clearRecentSearches,
    executeSearch,
    
    // Computed
    canSearch: canSearch(),
    hasSearchResults: !!routeState.searchResults && routeState.searchResults.length > 0,
    hasSearchHistory: routeState.searchHistory.length > 0,
    hasFavoriteRoutes: routeState.favoriteRoutes.length > 0,
    hasRecentSearches: routeState.recentSearches.length > 0,
    selectedRoute: routeState.searchResults?.find(
      route => route.route_id === mapState.selectedRouteId
    ),
  };
}
