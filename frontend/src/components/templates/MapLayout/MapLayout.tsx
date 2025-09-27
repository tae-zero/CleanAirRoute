'use client';

import React from 'react';
import { Header, Map, Sidebar, Footer } from '@/components/organisms';
import { useMap } from '@/hooks/useMap';
import { useRoute } from '@/hooks/useRoute';
import { useAirQuality } from '@/hooks/useAirQuality';

interface MapLayoutProps {
  className?: string;
}

export default function MapLayout({ className }: MapLayoutProps) {
  const {
    mapState,
    isMapLoaded,
    handleMapLoad,
    handleMapDragEnd,
    handleMapZoomChanged,
    handleMapClick,
    moveToCurrentLocation,
  } = useMap();

  const {
    startLocation,
    endLocation,
    searchResults,
    selectedRoute,
    canSearch,
    executeSearch,
    selectRoute,
  } = useRoute();

  const { data: airQualityData } = useAirQuality(mapState.center);

  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col ${className}`}>
      {/* 헤더 */}
      <Header />

      {/* 메인 컨텐츠 */}
      <main className="flex-1 flex flex-col lg:flex-row">
        {/* 지도 영역 */}
        <div className="flex-1 relative">
          <Map
            center={mapState.center}
            level={mapState.zoom}
            routes={searchResults}
            selectedRouteId={mapState.selectedRouteId}
            onRouteSelect={selectRoute}
            onMapClick={handleMapClick}
            showHeatmap={mapState.showHeatmap}
            showRoutes={mapState.showRoutes}
            isLoading={!isMapLoaded}
          />
        </div>

        {/* 사이드바 */}
        <Sidebar />
      </main>

      {/* 푸터 */}
      <Footer />
    </div>
  );
}
