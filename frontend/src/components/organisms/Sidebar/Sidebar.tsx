'use client';

import React from 'react';
import { SearchForm, AirQualityCard, RouteCard } from '@/components/molecules';
import { Button, Icon } from '@/components/atoms';
import { useMap } from '@/hooks/useMap';
import { useRoute } from '@/hooks/useRoute';
import { useAirQuality } from '@/hooks/useAirQuality';
import type { Location } from '@/types';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const { mapState, moveToCurrentLocation } = useMap();
  const {
    startLocation,
    endLocation,
    searchResults,
    selectedRoute,
    canSearch,
    executeSearch,
    selectRoute,
    toggleFavorite,
  } = useRoute();

  const { data: airQualityData } = useAirQuality(mapState.center);

  return (
    <div className={`w-full lg:w-96 bg-white shadow-lg flex flex-col ${className}`}>
      {/* 경로 검색 폼 */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          경로 검색
        </h2>
        <SearchForm
          startLocation={startLocation}
          endLocation={endLocation}
          onSearch={executeSearch}
          canSearch={canSearch}
        />
      </div>

      {/* 대기질 정보 */}
      {airQualityData && (
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            현재 대기질
          </h2>
          <AirQualityCard
            data={airQualityData.air_quality as any}
            location={airQualityData.station_info.station_name}
            timestamp={airQualityData.air_quality.measured_at}
            showDetails={true}
          />
        </div>
      )}

      {/* 경로 비교 */}
      {searchResults && searchResults.length > 0 && (
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              경로 비교
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={moveToCurrentLocation}
              title="현재 위치로 이동"
            >
              <Icon name="location" size="sm" className="mr-1" />
              현재 위치
            </Button>
          </div>
          <div className="space-y-3">
            {searchResults.map((route) => (
              <RouteCard
                key={route.route_id}
                route={route}
                isSelected={mapState.selectedRouteId === route.route_id}
                onSelect={selectRoute}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        </div>
      )}

      {/* 선택된 경로 상세 정보 */}
      {selectedRoute && (
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <h3 className="text-md font-semibold text-gray-900 mb-3">
            선택된 경로 정보
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">소요시간:</span>
              <span className="font-medium">
                {selectedRoute.summary.duration}분
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">거리:</span>
              <span className="font-medium">
                {selectedRoute.summary.distance.toFixed(1)}km
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">대기질 점수:</span>
              <span className="font-medium">
                {selectedRoute.summary.air_quality_score}/100
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">PM2.5 노출:</span>
              <span className="font-medium">
                {selectedRoute.summary.pollution_exposure.pm25.toFixed(1)}μg/m³
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 빈 상태 */}
      {!searchResults && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center text-gray-500">
            <Icon name="map" size="xl" className="mx-auto mb-4 text-gray-300" />
            <p>출발지와 도착지를 입력하여</p>
            <p>경로를 검색해보세요.</p>
          </div>
        </div>
      )}
    </div>
  );
}
